
import { cn } from "../lib/utils.ts";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: string;
  isBot?: boolean;
}

export const ChatMessage = ({ message, isBot = false }: ChatMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 leading-relaxed",
          isBot
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {message}
      </div>
    </motion.div>
  );
};
