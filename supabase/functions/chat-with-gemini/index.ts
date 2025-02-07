
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    // Call Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent", {
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

    const data = await response.json();
    let generatedText = "";

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      generatedText = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }

    return new Response(
      JSON.stringify({
        response: generatedText,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
