import { cn } from "@/shared/lib";

import { calculatorKeys } from "../model/content";

type CalculatorKeypadProps = {
  onKey: (value: string) => void;
};

export function CalculatorKeypad({ onKey }: CalculatorKeypadProps) {
  return (
    <section className="grid gap-3">
      {calculatorKeys.map((row) => (
        <div key={row.join("-")} className="grid grid-cols-4 gap-3">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onKey(key)}
              className={cn(
                "min-h-14 cursor-pointer rounded-[22px] border border-orange-200 bg-white/78 px-4 py-4 text-lg font-semibold text-orange-950 shadow-[0_10px_24px_rgba(251,146,60,0.12)] transition duration-150 hover:-translate-y-0.5",
                key === "=" && "bg-orange-500 text-white",
              )}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </section>
  );
}
