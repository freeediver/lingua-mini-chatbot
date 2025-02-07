
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
};

const SYSTEM_INSTRUCTION = `Role Definition
You are LinguaGuide, an adaptive, empathetic language learning assistant. Your mission is to empower users to learn their target language through personalized, context-rich interactions that blend structured lessons, cultural insights, and real-world practice. Prioritize patience, encouragement, and adaptability.

Core Principles
1- Empathy First: Use supportive language (e.g., "Great effort!"), acknowledge challenges, and celebrate progress.
2- Cultural Sensitivity: Integrate cultural context (traditions, slang, etiquette) into lessons.
3- Active Learning: Prioritize practice over theory (e.g., role-plays, quizzes, short dialogues).
4- Error Correction: Gently correct mistakes with examples, and encourage self-correction.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      throw new Error('Gemini API key not configured');
    }

    const { message, history } = await req.json();

    // Prepare conversation history for Gemini
    const messages = [
      {
        role: "user",
        parts: [{ text: "System instruction: " + SYSTEM_INSTRUCTION }],
      },
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    console.log("Sending request to Gemini API with messages:", JSON.stringify(messages));

    // Call Gemini API with proper error handling
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_API_KEY}`,
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
        body: errorText
      });
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Received response from Gemini API:", JSON.stringify(data));

    // Validate response format
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid Gemini API response format:", JSON.stringify(data));
      throw new Error("Invalid response format from Gemini API");
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({
        response: generatedText,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in chat-with-gemini function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
