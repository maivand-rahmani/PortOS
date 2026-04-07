import type { AiServiceContext } from "@/processes";
import type { TerminalEntry } from "./terminal-session";

export function buildTerminalAiContext(input: {
  windowId: string;
  currentPath: string;
  value: string;
  bridgeStatus: string;
  history: TerminalEntry[];
  recentCommands: string[];
}): AiServiceContext {
  const recentHistory = input.history.slice(-12).map((entry) => `${entry.kind}: ${entry.text}`).join("\n");

  return {
    sourceAppId: "terminal",
    sourceWindowId: input.windowId,
    selection: input.value.trim()
      ? {
          text: input.value,
        }
      : undefined,
    appState: {
      currentPath: input.currentPath,
      pendingCommand: input.value,
      bridgeStatus: input.bridgeStatus,
      recentCommands: input.recentCommands,
      sessionHistory: recentHistory,
    },
  };
}
