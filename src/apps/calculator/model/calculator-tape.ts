import type { AgentExternalRequest, NotesExternalRequestDetail } from "@/shared/lib";

import type { CalculationTapeEntry } from "./types";

const CALCULATOR_TAPE_STORAGE_KEY = "portos-calculator-tape";
const MAX_TAPE_ENTRIES = 10;

export const CALCULATOR_WORKING_TAPE_TITLE = "Calculator Working Tape";

function sortTape(entries: CalculationTapeEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return Number(right.pinned) - Number(left.pinned);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function formatTapeTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function loadCalculatorTape() {
  if (typeof window === "undefined") {
    return [] satisfies CalculationTapeEntry[];
  }

  const storedTape = window.localStorage.getItem(CALCULATOR_TAPE_STORAGE_KEY);

  if (!storedTape) {
    return [] satisfies CalculationTapeEntry[];
  }

  try {
    const parsed = JSON.parse(storedTape) as CalculationTapeEntry[];

    return sortTape(
      parsed.filter(
        (entry) =>
          typeof entry.id === "string" &&
          typeof entry.expression === "string" &&
          typeof entry.result === "string" &&
          typeof entry.createdAt === "string" &&
          typeof entry.pinned === "boolean",
      ),
    ).slice(0, MAX_TAPE_ENTRIES);
  } catch {
    return [] satisfies CalculationTapeEntry[];
  }
}

export function saveCalculatorTape(entries: CalculationTapeEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CALCULATOR_TAPE_STORAGE_KEY, JSON.stringify(sortTape(entries).slice(0, MAX_TAPE_ENTRIES)));
}

export function createCalculatorTapeEntry(expression: string, result: string): CalculationTapeEntry {
  return {
    id: crypto.randomUUID(),
    expression,
    result,
    createdAt: new Date().toISOString(),
    pinned: false,
  };
}

export function addCalculatorTapeEntry(entries: CalculationTapeEntry[], entry: CalculationTapeEntry) {
  return sortTape(
    [entry, ...entries.filter((item) => item.expression !== entry.expression || item.result !== entry.result)].slice(
      0,
      MAX_TAPE_ENTRIES,
    ),
  );
}

export function toggleTapeEntryPin(entries: CalculationTapeEntry[], entryId: string) {
  return sortTape(
    entries.map((entry) => (entry.id === entryId ? { ...entry, pinned: !entry.pinned } : entry)),
  );
}

export function buildCalculatorTapeNoteRequest(entry: CalculationTapeEntry): NotesExternalRequestDetail {
  return {
    mode: "upsert",
    title: CALCULATOR_WORKING_TAPE_TITLE,
    body: [
      `${formatTapeTimestamp(entry.createdAt)}`,
      `${entry.expression} = ${entry.result}`,
      "Source: PortOS Calculator",
    ].join("\n"),
    tags: ["calculator", "working-tape"],
    pinned: true,
    selectAfterWrite: true,
    source: "Calculator working tape",
  };
}

export function buildCalculatorAgentRequest(entry: CalculationTapeEntry): AgentExternalRequest {
  return {
    title: `Calculator check: ${entry.expression}`,
    prompt: [
      "Review this calculation from the PortOS calculator.",
      `Expression: ${entry.expression}`,
      `Result: ${entry.result}`,
      "Explain the order of operations, confirm whether the result is correct, and give one concise real-world interpretation if it fits.",
    ].join("\n"),
    source: {
      appId: "calculator",
      label: `${entry.expression} = ${entry.result}`,
    },
    suggestions: [
      "Explain the order of operations.",
      "Turn this into a quick note.",
      "Show a practical use for this result.",
    ],
  };
}
