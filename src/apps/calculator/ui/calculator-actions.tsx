import { cn } from "@/shared/lib";

import type { CalculationTapeEntry } from "../model/types";

type CalculatorActionsProps = {
  activeEntry: CalculationTapeEntry | null;
  onCopy: () => void | Promise<void>;
  onSendToAgent: () => void | Promise<void>;
  onSendToNotes: () => void | Promise<void>;
};

const baseButtonClassName =
  "min-h-11 cursor-pointer rounded-2xl border px-3 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-45";

export function CalculatorActions({ activeEntry, onCopy, onSendToAgent, onSendToNotes }: CalculatorActionsProps) {
  const disabled = !activeEntry;

  return (
    <section className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={() => void onCopy()}
        className={cn(baseButtonClassName, "border-orange-200 bg-white/78 text-orange-950 hover:-translate-y-0.5")}
      >
        Copy
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => void onSendToNotes()}
        className={cn(baseButtonClassName, "border-orange-200 bg-white/78 text-orange-950 hover:-translate-y-0.5")}
      >
        To Notes
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => void onSendToAgent()}
        className={cn(baseButtonClassName, "border-orange-400 bg-orange-500 text-white hover:-translate-y-0.5")}
      >
        Ask AI
      </button>
    </section>
  );
}
