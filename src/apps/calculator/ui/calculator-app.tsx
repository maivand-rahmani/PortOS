"use client";

import { useEffect, useRef } from "react";

import type { AppComponentProps } from "@/entities/app";

import { useCalculatorController } from "../model/use-calculator-controller";
import { CalculatorActions } from "./calculator-actions";
import { CalculatorDisplay } from "./calculator-display";
import { CalculatorKeypad } from "./calculator-keypad";
import { CalculatorTape } from "./calculator-tape";

export function CalculatorApp({ processId }: AppComponentProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const {
    activeEntry,
    clearTape,
    copyResult,
    error,
    expression,
    handleBackspace,
    handleKey,
    selectTapeEntry,
    sendToAgent,
    sendToNotes,
    status,
    tape,
    togglePin,
  } = useCalculatorController();

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onPointerDown={() => rootRef.current?.focus()}
      onKeyDown={(event) => {
        const allowedKeys = "0123456789+-*/().%";

        if (allowedKeys.includes(event.key)) {
          event.preventDefault();
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
          handleBackspace();
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          handleKey("AC");
        }
      }}
      className="calculator-app flex h-full min-h-0 flex-col gap-3 rounded-[24px] p-4 outline-none"
    >
      <CalculatorDisplay activeEntry={activeEntry} error={error} expression={expression} processId={processId} status={status} />
      <CalculatorActions activeEntry={activeEntry} onCopy={copyResult} onSendToAgent={sendToAgent} onSendToNotes={sendToNotes} />
      <CalculatorTape
        activeEntryId={activeEntry?.id ?? null}
        entries={tape}
        onClearTape={clearTape}
        onSelectEntry={selectTapeEntry}
        onTogglePin={togglePin}
      />
      <CalculatorKeypad onKey={handleKey} />
    </div>
  );
}
