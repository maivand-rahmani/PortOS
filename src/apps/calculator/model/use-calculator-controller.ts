import { useCallback, useEffect, useMemo, useState } from "react";

import { useOSStore } from "@/processes";
import { calculateExpression, openAgentWithRequest, openNotesWithRequest } from "@/shared/lib";

import {
  addCalculatorTapeEntry,
  buildCalculatorAgentRequest,
  buildCalculatorTapeNoteRequest,
  createCalculatorTapeEntry,
  loadCalculatorTape,
  saveCalculatorTape,
  toggleTapeEntryPin,
} from "./calculator-tape";
import { applyCalculatorInput, backspaceCalculatorExpression } from "./expression";
import type { CalculationTapeEntry } from "./types";

type CalculatorStatusTone = "muted" | "success" | "error";

type CalculatorStatus = {
  tone: CalculatorStatusTone;
  message: string;
};

function getDefaultStatus(): CalculatorStatus {
  return {
    tone: "muted",
    message: "Press Enter to solve and save a tape entry.",
  };
}

function canSendActiveEntry(entry: CalculationTapeEntry | null): entry is CalculationTapeEntry {
  return entry !== null;
}

export function useCalculatorController() {
  const fsHydrated = useOSStore((state) => state.fsHydrated);
  const [expression, setExpression] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [tape, setTape] = useState<CalculationTapeEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [status, setStatus] = useState<CalculatorStatus>(getDefaultStatus);

  useEffect(() => {
    if (!fsHydrated) {
      return;
    }

    let cancelled = false;

    const loadTape = async () => {
      const initialTape = await loadCalculatorTape();

      if (cancelled) {
        return;
      }

      setTape(initialTape);
      setActiveEntryId(initialTape[0]?.id ?? null);
    };

    void loadTape();

    return () => {
      cancelled = true;
    };
  }, [fsHydrated]);

  const persistTape = useCallback((updater: (current: CalculationTapeEntry[]) => CalculationTapeEntry[]) => {
    setTape((current) => {
      const nextTape = updater(current);
      void saveCalculatorTape(nextTape);
      return nextTape;
    });
  }, []);

  const activeEntry = useMemo(
    () => tape.find((entry) => entry.id === activeEntryId) ?? tape[0] ?? null,
    [activeEntryId, tape],
  );

  const clearExpression = useCallback(() => {
    setExpression("0");
    setError(null);
    setStatus(getDefaultStatus());
  }, []);

  const evaluateExpression = useCallback(() => {
    try {
      const result = calculateExpression(expression);
      const entry = createCalculatorTapeEntry(expression, result);

      setExpression(result);
      setError(null);
      setActiveEntryId(entry.id);
      setStatus({
        tone: "success",
        message: `Saved ${expression} = ${result}`,
      });

      persistTape((current) => addCalculatorTapeEntry(current, entry));
    } catch {
      setError("Invalid expression");
      setStatus({
        tone: "error",
        message: "Check operators and parentheses, then try again.",
      });
    }
  }, [expression, persistTape]);

  const handleKey = useCallback(
    (value: string) => {
      if (value === "AC") {
        clearExpression();
        return;
      }

      if (value === "=") {
        evaluateExpression();
        return;
      }

      setError(null);
      setStatus(getDefaultStatus());
      setExpression((current) => applyCalculatorInput(current, value));
    },
    [clearExpression, evaluateExpression],
  );

  const handleBackspace = useCallback(() => {
    setExpression((current) => backspaceCalculatorExpression(current));
    setError(null);
    setStatus(getDefaultStatus());
  }, []);

  const selectTapeEntry = useCallback((entry: CalculationTapeEntry) => {
    setExpression(entry.result);
    setError(null);
    setActiveEntryId(entry.id);
    setStatus({
      tone: "muted",
      message: `Loaded ${entry.expression} = ${entry.result}`,
    });
  }, []);

  const togglePin = useCallback(
    (entryId: string) => {
      persistTape((current) => toggleTapeEntryPin(current, entryId));

      setStatus({
        tone: "muted",
        message: "Updated tape pinning.",
      });
    },
    [persistTape],
  );

  const clearTape = useCallback(() => {
    persistTape(() => []);
    setActiveEntryId(null);
    setStatus({
      tone: "muted",
      message: "Tape cleared.",
    });
  }, [persistTape]);

  const copyResult = useCallback(async () => {
    const value = activeEntry?.result ?? expression;

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setStatus({
        tone: "error",
        message: "Clipboard is unavailable in this browser.",
      });
      return;
    }

    await navigator.clipboard.writeText(value);

    setStatus({
      tone: "success",
      message: `Copied ${value}`,
    });
  }, [activeEntry, expression]);

  const sendToNotes = useCallback(async () => {
    if (!canSendActiveEntry(activeEntry)) {
      setStatus({
        tone: "error",
        message: "Solve an expression before sending it to Notes.",
      });
      return;
    }

    await openNotesWithRequest(buildCalculatorTapeNoteRequest(activeEntry));
    setStatus({
      tone: "success",
      message: "Appended the selected calculation to Notes.",
    });
  }, [activeEntry]);

  const sendToAgent = useCallback(async () => {
    if (!canSendActiveEntry(activeEntry)) {
      setStatus({
        tone: "error",
        message: "Solve an expression before asking the AI agent.",
      });
      return;
    }

    await openAgentWithRequest(buildCalculatorAgentRequest(activeEntry));
    setStatus({
      tone: "success",
      message: "Sent the selected calculation to the AI agent.",
    });
  }, [activeEntry]);

  return {
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
  };
}
