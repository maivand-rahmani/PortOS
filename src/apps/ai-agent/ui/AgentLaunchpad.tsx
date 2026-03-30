import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

type AgentLaunchpadProps = {
  processId: string;
  suggestions: string[];
  showcaseCards: Array<{
    title: string;
    description: string;
    prompt: string;
  }>;
  onSelect: (suggestion: string) => void;
};

export function AgentLaunchpad({ processId, suggestions, showcaseCards, onSelect }: AgentLaunchpadProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.94))] px-4 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:px-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827,#334155)] text-white shadow-[0_18px_50px_rgba(15,23,42,0.22)]">
          <Sparkles className="h-6 w-6" strokeWidth={2.3} />
        </div>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">Start with a real workflow</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          I can explain architecture, open PortOS apps, or turn another app into a live handoff instead of a disconnected chat.
        </p>
        <div className="mt-2 text-sm text-slate-400">Session {processId.slice(0, 6)}</div>
      </div>

      <div className="mt-8 grid w-full gap-3 lg:grid-cols-2">
        {showcaseCards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => onSelect(card.prompt)}
            className="group flex min-h-[112px] cursor-pointer flex-col justify-between rounded-[26px] border border-slate-200 bg-white px-5 py-5 text-left shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30"
          >
            <div>
              <div className="text-base font-semibold text-slate-900">{card.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              Try this
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="group flex min-h-[84px] cursor-pointer items-start justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30"
          >
            <span className="max-w-[80%] text-[15px] font-medium leading-6 text-slate-800">{suggestion}</span>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
