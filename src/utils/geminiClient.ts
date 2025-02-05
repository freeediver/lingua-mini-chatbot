
import { createClient } from '@supabase/supabase-js';

export type Message = {
  text: string;
  isBot: boolean;
};

export const sendMessageToGemini = async (message: string, history: Message[]) => {
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

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
