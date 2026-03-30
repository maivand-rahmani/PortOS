import { cn } from "@/shared/lib";

import { formatTapeTimestamp } from "../model/calculator-tape";
import type { CalculationTapeEntry } from "../model/types";

type CalculatorTapeProps = {
  activeEntryId: string | null;
  entries: CalculationTapeEntry[];
  onClearTape: () => void;
  onSelectEntry: (entry: CalculationTapeEntry) => void;
  onTogglePin: (entryId: string) => void;
};

export function CalculatorTape({
  activeEntryId,
  entries,
  onClearTape,
  onSelectEntry,
  onTogglePin,
}: CalculatorTapeProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-white/60 bg-white/58 p-3 shadow-panel">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-orange-700/60">Working Tape</p>
          <p className="mt-1 text-xs text-orange-900/55">Pinned calculations stay at the top and can be sent to Notes or the AI agent.</p>
        </div>
        <button
          type="button"
          onClick={onClearTape}
          disabled={entries.length === 0}
          className="min-h-11 cursor-pointer rounded-2xl border border-orange-200 bg-white/85 px-3 py-2 text-xs font-semibold text-orange-950 transition duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Clear
        </button>
      </div>
      {entries.length > 0 ? (
        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-auto pr-1">
          {entries.map((entry) => {
            const isActive = entry.id === activeEntryId;

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-2 rounded-[20px] border p-2 transition duration-150",
                  isActive
                    ? "border-orange-300 bg-orange-50/95 shadow-[0_18px_32px_rgba(249,115,22,0.12)]"
                    : "border-white/60 bg-white/82 hover:border-orange-200",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectEntry(entry)}
                  className="min-h-11 min-w-0 flex-1 cursor-pointer rounded-[16px] px-2 py-2 text-left"
                >
                  <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-orange-700/55">
                    {formatTapeTimestamp(entry.createdAt)}
                  </p>
                  <p className="mt-1 truncate text-sm text-orange-900/70">{entry.expression}</p>
                  <p className="mt-1 truncate font-display text-xl font-semibold text-orange-950">{entry.result}</p>
                </button>
                <button
                  type="button"
                  onClick={() => onTogglePin(entry.id)}
                  aria-pressed={entry.pinned}
                  className={cn(
                    "min-h-11 min-w-11 cursor-pointer rounded-2xl border px-3 text-xs font-semibold transition duration-150",
                    entry.pinned
                      ? "border-orange-400 bg-orange-500 text-white"
                      : "border-orange-200 bg-white/85 text-orange-950 hover:-translate-y-0.5",
                  )}
                >
                  Pin
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 rounded-[20px] border border-dashed border-orange-200/80 bg-white/70 px-4 py-5 text-sm leading-6 text-orange-900/60">
          Solve something to start a reusable tape. Each saved result can be restored, pinned, appended to Notes, or handed off to the AI agent.
        </div>
      )}
    </section>
  );
}
