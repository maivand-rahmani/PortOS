"use client";

import { useCallback, useEffect, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { calculateExpression, cn } from "@/shared/lib";

import { calculatorKeys } from "../model/content";

export function CalculatorApp({ processId }: AppComponentProps) {
  const [expression, setExpression] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const handleKey = useCallback((value: string) => {
    if (value === "AC") {
      setExpression("0");
      setError(null);
      return;
    }

    if (value === ".") {
      const segments = expression.split(/[+\-*/]/);
      const currentSegment = segments[segments.length - 1] ?? "";

      if (currentSegment.includes(".")) {
        return;
      }
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

    setError(null);
    setExpression((current) => (current === "0" ? value : `${current}${value}`));
  }, [expression]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const allowedKeys = "0123456789+-*/().%";

      if (allowedKeys.includes(event.key)) {
        handleKey(event.key);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleKey("=");
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setExpression((current) => {
          const nextValue = current.slice(0, -1);
          return nextValue.length > 0 ? nextValue : "0";
        });
        setError(null);
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleKey]);

  return (
    <div className="calculator-app flex h-full min-h-full flex-col gap-4 rounded-[24px] p-4">
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
