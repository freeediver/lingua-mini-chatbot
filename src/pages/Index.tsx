
import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { motion } from "framer-motion";

const Index = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm LinguaGuide, your language learning assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    setMessages((prev) => [...prev, { text: message, isBot: false }]);
    setIsLoading(true);

    // Simulate bot response (replace with actual API call later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "I understand you're interested in language learning. Could you tell me which language you'd like to focus on?",
          isBot: true,
        },
      ]);
      setIsLoading(false);
    }, 1000);
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
