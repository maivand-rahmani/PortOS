import { ArrowUpRight, Layers3, X } from "lucide-react";

import type { AgentExternalRequest } from "../model/external";

type AgentHandoffBarProps = {
  request: AgentExternalRequest | null;
  requestSummary: string;
  queuedRequestCount: number;
  onDismiss: () => void;
  onOpenSource: () => void;
  onSelectSuggestion: (suggestion: string) => void;
};

export function AgentHandoffBar({
  request,
  requestSummary,
  queuedRequestCount,
  onDismiss,
  onOpenSource,
  onSelectSuggestion,
}: AgentHandoffBarProps) {
  if (!request) {
    return null;
  }

  return (
    <div className="mb-4 rounded-[28px] border border-[#ffd7cf] bg-[linear-gradient(135deg,rgba(255,245,242,0.98),rgba(255,255,255,0.96))] p-4 shadow-[0_18px_44px_rgba(255,107,87,0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d45744]">
            <span>Live handoff</span>
            {queuedRequestCount > 0 ? (
              <span className="inline-flex min-h-[24px] items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] tracking-[0.14em] text-slate-600">
                <Layers3 className="h-3.5 w-3.5" strokeWidth={2.2} />
                {queuedRequestCount} queued
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-base font-semibold text-slate-900">{requestSummary}</div>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{request.prompt}</p>
        </div>

        <div className="flex items-center gap-2">
          {request.source?.appId ? (
            <button
              type="button"
              onClick={onOpenSource}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-white bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30"
            >
              Open source
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss handoff banner"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white bg-white text-slate-500 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30"
          >
            <X className="h-4.5 w-4.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {request.suggestions && request.suggestions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {request.suggestions.slice(0, 4).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              className="inline-flex min-h-[40px] cursor-pointer items-center rounded-full border border-[#ffd7cf] bg-white px-3 py-2 text-sm text-slate-700 transition-colors duration-200 hover:border-[#ffb9ac] hover:bg-[#fff7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/30"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
