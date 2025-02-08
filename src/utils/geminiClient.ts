
import { GEMINI_API_KEY, GEMINI_API_URL, SYSTEM_INSTRUCTION } from "../config/config";

export type Message = {
  text: string;
  isBot: boolean;
};

type GeminiMessage = {
  role: string;
  parts: { text: string }[];
};

const generation_config = {
  temperature: 1,
  top_p: 0.95,
  top_k: 40,
  max_output_tokens: 8192,
};

export const sendMessageToGemini = async (message: string, history: Message[]) => {
  try {
    // Convert chat history to Gemini format
    const messages: GeminiMessage[] = [
      {
        role: "user",
        parts: [{ text: "System instruction: " + SYSTEM_INSTRUCTION }],
      },
      ...history.map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        parts: [{ text: msg.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: generation_config,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid Gemini API response format:", JSON.stringify(data));
      throw new Error("Invalid response format from Gemini API");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
  }
};
