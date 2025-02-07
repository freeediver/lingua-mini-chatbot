
import { createClient } from '@supabase/supabase-js';

export type Message = {
  text: string;
  isBot: boolean;
};

// Create Supabase client with explicit URL and key checks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const sendMessageToGemini = async (message: string, history: Message[]) => {
  try {
    const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
      body: {
        message,
        history: history.map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.text
        }))
      }
    });

    if (error) throw error;
    return data.response;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
  }
};
