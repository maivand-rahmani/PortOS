"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, Sparkles, UserRoundSearch } from "lucide-react";

import type { WindowPosition } from "@/entities/window";

type DesktopAiTeaserProps = {
  isBooting: boolean;
  position: WindowPosition | null;
  onOpenAgent: () => void;
  onRunPrompt: (prompt: string) => void;
  onDragStart: (pointer: WindowPosition) => void;
};

const CTA_ITEMS = [
  {
    label: "Why hire Maivand?",
    prompt: "Why should I hire you? Show me the strongest proof inside this OS.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Show the best project",
    prompt: "Show me your strongest project and explain why it matters.",
    icon: Sparkles,
  },
  {
    label: "Client mode",
    prompt: "If I am a client, what can you build for me and why should I trust you?",
    icon: UserRoundSearch,
  },
];

export function DesktopAiTeaser({ isBooting, position, onOpenAgent, onRunPrompt, onDragStart }: DesktopAiTeaserProps) {
  if (!position) {
    return null;
  }

  return (
    <motion.article
      initial={isBooting ? { opacity: 0, x: -16 } : { opacity: 0, x: -12 }}
      animate={isBooting ? { opacity: 0, x: -16 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.18 }}
      className="pointer-events-auto absolute z-11 hidden w-[340px] rounded-[30px] border border-white/70 bg-white/72 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl xl:block"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        type="button"
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return;
          }

          event.stopPropagation();
          onDragStart({
            x: event.clientX,
            y: event.clientY,
          });
        }}
        className="inline-flex min-h-[36px] cursor-grab items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30 active:cursor-grabbing"
        aria-label="Drag AI widget"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#ff6b57]" strokeWidth={2.4} />
        AI widget
      </button>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
        Talk to Maivand inside the OS.
      </h2>
      <p className="mt-3 text-[15px] leading-7 text-slate-600">
        Ask about projects, architecture, hiring fit, or let the agent run a live portfolio walkthrough inside the OS.
      </p>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpenAgent();
        }}
        className="mt-5 inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/35"
      >
        Open AI agent
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
      </button>

      <div className="mt-5 space-y-2">
        {CTA_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRunPrompt(item.prompt);
              }}
              className="flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                </span>
                <span className="text-sm font-medium text-slate-800">{item.label}</span>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2.2} />
            </button>
          );
        })}
      </div>
    </motion.article>
  );
}
