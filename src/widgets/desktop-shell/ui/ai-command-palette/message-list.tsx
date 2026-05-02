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
        className="h-full min-h-0 overflow-y-auto overscroll-contain pr-2"
      >
        {messages.length === 0 && !streamingContent ? (
          <div className="flex min-h-full items-center justify-center py-10">
            <div className="w-full max-w-[32rem] rounded-2xl border border-border bg-surface px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-foreground">
                Ask for help with your current task
              </h3>
              <p className="mx-auto mt-2 max-w-[26rem] text-[13px] leading-6 text-muted">
                Pick an action, add a prompt if needed, and the response will build here like a focused conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-full flex-col py-4">
            <div className="mt-auto" />
            <div className="flex flex-col gap-4">
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
                    "flex max-w-[85%] gap-3 rounded-2xl px-4 py-3 text-[14px] leading-relaxed sm:max-w-[80%]",
                    message.role === "user"
                      ? "bg-foreground text-background"
                      : message.role === "error"
                        ? "border border-red-500/20 bg-red-500/10 text-foreground"
                        : "text-foreground",
                  )}
                >
                  {message.role === "assistant" && (
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  )}
                  {message.role === "error" && (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  )}

                  <div className="min-w-0 flex-1 break-words">
                    {message.role === "user" || message.role === "error" ? (
                      <p className="whitespace-pre-wrap break-words leading-6">{message.content}</p>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-7">
                        {message.content}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}

              {streamingContent ? (
                <div className="flex w-full justify-start">
                  <div className="flex max-w-[85%] gap-3 rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-foreground sm:max-w-[80%]">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 animate-pulse text-accent" />
                    <div className="min-w-0 flex-1 break-words">
                      <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-7">
                        {streamingContent}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {!autoScroll && (messages.length > 0 || streamingContent) ? (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-2 rounded-full border border-border bg-window px-3 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-xl transition hover:bg-surface"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Latest
        </button>
      ) : null}
    </div>
  );
}
