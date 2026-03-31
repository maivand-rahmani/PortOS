import type { TerminalExternalRequestDetail } from "@/shared/lib";
import { consumePendingTerminalExternalRequest } from "@/shared/lib";

const SESSION_HISTORY_LIMIT = 12;

export type TerminalEntry = {
  id: string;
  kind: "system" | "command" | "output" | "error";
  text: string;
};

export type TerminalQuickAction = {
  id: string;
  label: string;
  command: string;
  description: string;
};

export function createTerminalEntry(kind: TerminalEntry["kind"], text: string): TerminalEntry {
  return {
    id: crypto.randomUUID(),
    kind,
    text,
  };
}

export function createInitialTerminalHistory(processId: string) {
  return [
    createTerminalEntry("system", `PortOS terminal ${processId.slice(0, 6)}`),
    createTerminalEntry("system", "Type `help` to see available commands."),
  ];
}

export function buildCommandSuggestions(baseCommands: readonly string[], appIds: string[], value: string) {
  const allCommands = [...baseCommands, ...appIds.map((appId) => `open ${appId}`)];
  const query = value.trim().toLowerCase();

  if (!query) {
    return allCommands.slice(0, 6);
  }

  return allCommands.filter((item) => item.startsWith(query)).slice(0, 6);
}

export function pushCommandHistory(history: string[], command: string) {
  return [...history.filter((item) => item !== command), command].slice(-SESSION_HISTORY_LIMIT);
}

export function buildRecentCommands(history: string[]): TerminalQuickAction[] {
  return [...history]
    .reverse()
    .slice(0, 5)
    .map((command, index) => ({
      id: `recent-${index}-${command}`,
      label: command,
      command,
      description: "Reuse a recent command.",
    }));
}

export function buildRuntimeQuickActions(currentPath: string): TerminalQuickAction[] {
  return [
    {
      id: "runtime-sysinfo",
      label: "sysinfo",
      command: "sysinfo",
      description: "Inspect runtime phase and counts.",
    },
    {
      id: "runtime-windows",
      label: "windows",
      command: "windows",
      description: "List open windows and focus state.",
    },
    {
      id: "runtime-ps",
      label: "ps",
      command: "ps",
      description: "Show running processes.",
    },
    {
      id: "runtime-tree",
      label: `tree ${currentPath === "/" ? "." : currentPath}`,
      command: `tree ${currentPath === "/" ? "." : currentPath}`,
      description: "Print the current directory tree.",
    },
    {
      id: "runtime-ls",
      label: "ls",
      command: "ls",
      description: "List files in current directory.",
    },
  ];
}

export function readPendingTerminalExternalRequest(windowId: string) {
  return consumePendingTerminalExternalRequest(windowId);
}

export function buildTerminalBridgeMessage(request: TerminalExternalRequestDetail) {
  const source = request.source ? ` from ${request.source}` : "";
  const mode = request.execute ? "auto-run" : "prefill";

  return `External ${mode}${source}: ${request.command}`;
}
