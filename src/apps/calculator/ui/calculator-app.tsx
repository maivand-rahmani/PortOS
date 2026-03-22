"use client";

import { useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { calculateExpression, cn } from "@/shared/lib";

import { calculatorKeys } from "../model/content";

export function CalculatorApp({ processId }: AppComponentProps) {
  const [expression, setExpression] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const appendValue = (value: string) => {
    setError(null);
    setExpression((current) => (current === "0" ? value : `${current}${value}`));
  };

  const handleKey = (value: string) => {
    if (value === "AC") {
      setExpression("0");
      setError(null);
      return;
    }

    if (value === "=") {
      try {
        setExpression(calculateExpression(expression));
        setError(null);
      } catch {
        setError("Invalid expression");
      }

      return;
    }

    appendValue(value);
  };

  return (
    <div className="calculator-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <section className="rounded-[24px] bg-white/72 p-5 shadow-panel">
        <p className="text-[11px] uppercase tracking-[0.24em] text-orange-700/55">Calculator</p>
        <p className="mt-2 text-xs text-orange-900/55">PID {processId.slice(0, 6)}</p>
        <p className="mt-6 break-all text-right font-display text-5xl font-semibold text-orange-950">{expression}</p>
        <p className="mt-3 min-h-5 text-right text-sm text-red-600">{error}</p>
      </section>
      <section className="grid flex-1 gap-3">
        {calculatorKeys.map((row) => (
          <div key={row.join("-")} className="grid grid-cols-4 gap-3">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKey(key)}
                className={cn(
                  "cursor-pointer rounded-[22px] border border-orange-200 bg-white/78 px-4 py-5 text-lg font-semibold text-orange-950 shadow-[0_10px_24px_rgba(251,146,60,0.12)] transition duration-150 hover:-translate-y-0.5",
                  key === "=" && "bg-orange-500 text-white",
                )}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
