import { cn } from "@/shared/lib";

import type { CalculationTapeEntry } from "../model/types";

type CalculatorDisplayProps = {
  activeEntry: CalculationTapeEntry | null;
  error: string | null;
  expression: string;
  processId: string;
  status: {
    tone: "muted" | "success" | "error";
    message: string;
  };
};

export function CalculatorDisplay({ activeEntry, error, expression, processId, status }: CalculatorDisplayProps) {
  const feedbackTone = error ? "error" : status.tone;
  const feedbackMessage = error ?? status.message;

  return (
    <section className="rounded-[24px] bg-white/72 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-orange-700/55">Calculator</p>
          <p className="mt-2 text-xs text-orange-900/55">PID {processId.slice(0, 6)}</p>
        </div>
        {activeEntry ? (
          <div className="max-w-[12rem] rounded-full border border-orange-200/80 bg-orange-50/90 px-3 py-1 text-right text-[11px] font-medium text-orange-900/70">
            {activeEntry.expression} = {activeEntry.result}
          </div>
        ) : null}
      </div>
      <p className="mt-6 break-all text-right font-display text-5xl font-semibold text-orange-950">{expression}</p>
      <p
        className={cn(
          "mt-3 min-h-5 text-right text-sm",
          feedbackTone === "error" && "text-red-600",
          feedbackTone === "success" && "text-emerald-700",
          feedbackTone === "muted" && "text-orange-900/55",
        )}
      >
        {feedbackMessage}
      </p>
    </section>
  );
}
