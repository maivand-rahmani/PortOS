import type { AiServiceContext } from "@/processes";

export function buildCalculatorAiContext(input: {
  windowId: string;
  expression: string;
  error: string | null;
  tapeEntryCount: number;
  activeEntryResult: string | null;
  activeEntryExpression: string | null;
}): AiServiceContext {
  return {
    sourceAppId: "calculator",
    sourceWindowId: input.windowId,
    appState: {
      expression: input.expression,
      error: input.error,
      tapeEntryCount: input.tapeEntryCount,
      activeEntryResult: input.activeEntryResult,
      activeEntryExpression: input.activeEntryExpression,
    },
  };
}