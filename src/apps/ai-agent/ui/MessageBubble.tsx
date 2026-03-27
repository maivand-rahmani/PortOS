import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { cn } from "@/shared/lib";

import type { AgentChatMessage } from "../model/contextLoader";

type MessageBubbleProps = {
  message: AgentChatMessage;
  isStreaming?: boolean;
};

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "relative flex w-full",
        isUser ? "justify-end" : "justify-start",
        isSystem && "justify-center",
      )}
    >
      <div
        className={cn(
          "relative max-w-[90%] px-4 py-3 sm:max-w-[80%] sm:px-5",
          isUser && "rounded-[26px] rounded-br-[10px] bg-slate-900 text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)]",
          !isUser && !isSystem && "rounded-[26px] rounded-bl-[10px] border border-slate-200 bg-white text-slate-900 shadow-[0_14px_34px_rgba(15,23,42,0.08)]",
          isSystem && "rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-600",
        )}
      >
        {isSystem ? (
          <p className="whitespace-pre-wrap text-center leading-6">{message.content}</p>
        ) : (
          <div className="min-w-0">
            {!isUser ? (
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b57]/12 text-[#ff6b57]">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2.3} />
                </span>
                Maivand
              </div>
            ) : null}

            <p className={cn("whitespace-pre-wrap text-[15px] leading-7 sm:text-base", isUser ? "text-white" : "text-slate-800")}>
              {message.content}
              {isStreaming ? (
                <span className={cn("ml-1 inline-block h-5 w-[2px] animate-pulse align-middle", isUser ? "bg-white/80" : "bg-slate-400")} />
              ) : null}
            </p>

          </div>
        )}
      </div>
    </motion.div>
  );
}
