
import { useState } from "react";
import { ChatMessage } from "../components/ChatMessage.tsx";
import { ChatInput } from "../components/ChatInput.tsx";
import { motion } from "framer-motion";
import { sendMessageToGemini, Message } from "../utils/geminiClient.ts";
import { useToast } from "../components/ui/use-toast.ts";
import React from "react";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm LinguaGuide, your adaptive language learning assistant. To get started, could you tell me which language you'd like to learn and what your goals are (e.g., travel, work, or personal interest)?",
      isBot: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    try {
      setMessages((prev) => [...prev, { text: message, isBot: false }]);
      setIsLoading(true);

      const response = await sendMessageToGemini(message, messages);
      
      setMessages((prev) => [
        ...prev,
        {
          text: response,
          isBot: true,
        },
      ]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response. Please try again.",
      });
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b py-4 px-6">
        <h1 className="text-2xl font-semibold text-center text-foreground">
          LinguaGuide
        </h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container max-w-2xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isBot={message.isBot}
            />
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 p-2"
            >
              <div className="h-2 w-2 rounded-full bg-primary animate-loader-pulse" />
              <div className="h-2 w-2 rounded-full bg-primary animate-loader-pulse delay-150" />
              <div className="h-2 w-2 rounded-full bg-primary animate-loader-pulse delay-300" />
            </motion.div>
          )}
        </div>
      </main>
      <footer className="border-t">
        <div className="container max-w-2xl mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default Index;
