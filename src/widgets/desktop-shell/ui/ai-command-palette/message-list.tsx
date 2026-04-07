import { useEffect, useRef, useState } from "react";
import { Sparkles, AlertCircle, ArrowDown } from "lucide-react";

import { type AiMessage } from "@/processes";
import { cn } from "@/shared/lib/cn/cn";

export type MessageListProps = {
  messages: AiMessage[];
  streamingContent: string;
};

export function MessageList({ messages, streamingContent }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: streamingContent ? "auto" : "smooth",
        });
      });
    }
  }, [messages, streamingContent, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 24;

    setAutoScroll(isAtBottom);
  };

  return (
    <div className="relative h-full min-h-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain pr-2"
      >
        {messages.length === 0 && !streamingContent ? (
          <div className="flex min-h-full flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[34rem] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-8 py-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#ff8a7a] via-[#ff6b57] to-[#ff4d73] text-white shadow-[0_18px_40px_rgba(255,107,87,0.32)]">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted/60">
                System AI
              </p>
              <h3 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-foreground">
                Ask for help inside your current workflow
              </h3>
              <p className="mx-auto mt-3 max-w-[28rem] text-sm leading-6 text-muted/80">
                Pick an action, add a prompt if needed, and the response will build here like a focused conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-full flex-col justify-end gap-5 py-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[85%] gap-3 rounded-[24px] px-4 py-3.5 text-[14px] leading-relaxed shadow-sm sm:max-w-[80%]",
                    message.role === "user"
                      ? "bg-[linear-gradient(135deg,#0a84ff,#4b9dff)] text-white shadow-[0_18px_40px_rgba(10,132,255,0.28)]"
                      : message.role === "error"
                        ? "border border-red-400/25 bg-red-500/12 text-red-100"
                        : "border border-white/10 bg-white/7 text-foreground shadow-[0_18px_40px_rgba(15,23,42,0.12)]",
                  )}
                >
                  {message.role === "assistant" && (
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  )}
                  {message.role === "error" && (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1 break-words">
                    {message.role === "user" || message.role === "error" ? (
                      <p className="whitespace-pre-wrap break-words leading-6">{message.content}</p>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-7 text-foreground/92">
                        {message.content}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {streamingContent ? (
              <div className="flex w-full justify-start">
                <div className="flex max-w-[85%] gap-3 rounded-[24px] border border-white/10 bg-white/7 px-4 py-3.5 text-[14px] leading-relaxed text-foreground shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:max-w-[80%]">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 animate-pulse text-accent" />
                  <div className="min-w-0 flex-1 break-words">
                    <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-7 text-foreground/92">
                      {streamingContent}
                    </pre>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {!autoScroll && (messages.length > 0 || streamingContent) ? (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-surface/88 px-3 text-xs font-medium text-foreground shadow-[0_14px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:bg-surface"
        >
          <ArrowDown className="h-4 w-4" />
          Latest
        </button>
      ) : null}
    </div>
  );
}
