"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, RotateCcw, Sparkles } from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import { cn } from "@/shared/lib";

import { buildAiAgentAiContext } from "../model/ai-agent-ai-context";
import { useAiAgent } from "../model/agent";
import { AgentHandoffBar } from "./AgentHandoffBar";
import { AgentLaunchpad } from "./AgentLaunchpad";
import { Input } from "./Input";
import { MessageBubble } from "./MessageBubble";

export function ChatWindow({ processId, windowId }: AppComponentProps) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const aiPublishWindowContext = useOSStore((state) => state.aiPublishWindowContext);
  const aiClearWindowContext = useOSStore((state) => state.aiClearWindowContext);
  const {
    messages,
    input,
    setInput,
    isStreaming,
    error,
    suggestions,
    hasUserMessages,
    sendMessage,
    activeRequest,
    queuedRequestCount,
    dismissActiveRequest,
    openRequestSource,
    activeRequestSummary,
    clearHistory,
  } = useAiAgent(processId);

  useEffect(() => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    node.scrollTo({ top: node.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, reduceMotion]);

  useEffect(() => {
    aiPublishWindowContext(
      windowId,
      buildAiAgentAiContext({
        windowId,
        messageCount: messages.length,
        isStreaming,
        hasUserMessages,
        activeRequestSource: activeRequest?.source?.label ?? null,
      }),
    );
  }, [activeRequest?.source?.label, aiPublishWindowContext, hasUserMessages, isStreaming, messages.length, windowId]);

  useEffect(() => {
    return () => {
      aiClearWindowContext(windowId);
    };
  }, [aiClearWindowContext, windowId]);

  const conversationMessages = useMemo(
    () => messages.filter((message) => message.role !== "system" || message.content.trim()),
    [messages],
  );
  const visibleMessages = useMemo(
    () => conversationMessages.filter((message) => message.role !== "system"),
    [conversationMessages],
  );
  const showLaunchpad = useMemo(() => !hasUserMessages && !isStreaming, [hasUserMessages, isStreaming]);
  const showcaseCards = useMemo(
    () => [
      {
        title: "Recruiter mode",
        description: "Get the strongest hiring proof fast.",
        prompt: "Why should I hire you? Show me the strongest proof inside this OS.",
      },
      {
        title: "Portfolio tour",
        description: "Let the agent guide the whole experience.",
        prompt: "Run a live portfolio walkthrough. Open portfolio first, then resume, then docs, and explain clearly why each one matters for hiring or client trust.",
      },
      {
        title: "Client mode",
        description: "See what I can build and how I think.",
        prompt: "If I am a client, what can you build for me and why should I trust you?",
      },
      {
        title: "Contact flow",
        description: "Jump straight to resume, contact, and proof.",
        prompt: "I want to hire you or contact you. Show me the fastest path and open the relevant apps.",
      },
    ],
    [],
  );

  return (
    <div className="ai-agent-app  h-full min-h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <div className=" flex h-full min-h-full min-w-full max-w-[1400px] flex-col ">
        <div className="pointer-events-none absolute right-5 top-5 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={clearHistory}
            className="pointer-events-auto inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/78 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30"
            aria-label="Clear chat history"
          >
            <RotateCcw className="h-4.5 w-4.5" strokeWidth={2.2} />
          </button>

        </div>

        <section className="relative flex min-h-0 w-full overflow-hidden border border-white/70 bg-white/68 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_72%)]" />

          <div className="flex min-h-0 flex-1">
            <div className="flex min-h-0 flex-1 flex-col">
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
                <div className="mx-auto flex min-h-full w-full max-w-full flex-col justify-end gap-6">
                  <AgentHandoffBar
                    request={activeRequest}
                    requestSummary={activeRequestSummary}
                    queuedRequestCount={queuedRequestCount}
                    onDismiss={dismissActiveRequest}
                    onOpenSource={() => {
                      void openRequestSource();
                    }}
                    onSelectSuggestion={(suggestion) => {
                      void sendMessage(suggestion);
                    }}
                  />

                  {showLaunchpad ? (
                    <AgentLaunchpad
                      processId={processId}
                      suggestions={suggestions}
                      showcaseCards={showcaseCards}
                      onSelect={(suggestion) => {
                        void sendMessage(suggestion);
                      }}
                    />
                  ) : (
                    <AnimatePresence initial={false}>
                      {conversationMessages.map((message, index) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isStreaming={isStreaming && index === conversationMessages.length - 1 && message.role === "assistant"}
                        />
                      ))}
                    </AnimatePresence>
                  )}

                  {isStreaming && visibleMessages[visibleMessages.length - 1]?.content === "" ? <LoadingSkeleton /> : null}
                </div>
              </div>

              <div className="relative bottom-0 border-t border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(248,250,252,0.92))] px-4 pb-4 pt-4 backdrop-blur-xl sm:px-8 sm:pb-6">
                <div className="mx-auto max-w-4xl">
                  {visibleMessages.length > 0 && visibleMessages.length <= 2 ? (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            void sendMessage(suggestion);
                          }}
                          className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30"
                        >
                          <ArrowUpRight className="h-4 w-4 text-slate-400" strokeWidth={2.2} />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <Input
                    value={input}
                    isStreaming={isStreaming}
                    onChange={setInput}
                    onSubmit={(value) => {
                      void sendMessage(value);
                    }}
                  />

                  <div className="mt-3 flex min-h-[24px] items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="truncate">Enter sends. Shift + Enter adds a new line.</span>
                    <span className={cn("shrink-0", error && "text-red-600")}>{error ?? (isStreaming ? "Generating..." : `Session ${processId.slice(0, 6)}`)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b57]/12 text-[#ff6b57]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.3} />
          </span>
          Maivand
        </div>
        <div className="space-y-3">
          <div className="ai-agent-app__skeleton-line h-4 w-[72%] rounded-full" />
          <div className="ai-agent-app__skeleton-line h-4 w-[94%] rounded-full" />
          <div className="ai-agent-app__skeleton-line h-4 w-[66%] rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
