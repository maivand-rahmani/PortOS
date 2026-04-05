"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Bolt, Command, CornerDownLeft, History, MonitorCog, Sparkles, WandSparkles } from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import {
  closeWindowById,
  cn,
  focusWindowById,
  getRuntimeSnapshot,
  maximizeWindowById,
  minimizeWindowById,
  openAppById,
  restoreWindowById,
  TERMINAL_EXTERNAL_REQUEST_EVENT,
  terminateProcessById,
  type TerminalExternalRequestDetail,
} from "@/shared/lib";
import { runTerminalCommand } from "@/shared/lib/app-logic";

import {
  buildCommandSuggestions,
  buildRecentCommands,
  buildRuntimeQuickActions,
  buildTerminalBridgeMessage,
  createInitialTerminalHistory,
  createTerminalEntry,
  loadRecentTerminalCommands,
  pushCommandHistory,
  readPendingTerminalExternalRequest,
  saveRecentTerminalCommands,
  subscribeToRecentTerminalCommands,
  type TerminalEntry,
  type TerminalQuickAction,
} from "../model/terminal-session";

const PROMPT_USER = "guest@portos";
const BASE_COMMANDS = [
  "help",
  "pwd",
  "ls",
  "cd",
  "cat",
  "echo",
  "date",
  "clear",
  "whoami",
  "apps",
  "open",
  "tree",
  "mkdir",
  "touch",
  "rm",
  "mv",
  "cp",
  "ps",
  "windows",
  "sysinfo",
  "focus",
  "minimize",
  "maximize",
  "restore",
  "close",
  "kill",
] as const;

export function TerminalApp({ processId, windowId }: AppComponentProps) {
  const apps = useOSStore((state) => state.apps);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [history, setHistory] = useState<TerminalEntry[]>(() => createInitialTerminalHistory(processId));
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [bridgeStatus, setBridgeStatus] = useState("Ready for local input");
  const commandHistoryRef = useRef<string[]>([]);
  const historyContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const skipNextRecentCommandsSyncRef = useRef(false);

  const availableApps = useMemo(
    () => apps.map((app) => ({ id: app.id, name: app.name, description: app.description })),
    [apps],
  );

  const commandSuggestions = useMemo(
    () => buildCommandSuggestions(BASE_COMMANDS, availableApps.map((app) => app.id), value),
    [availableApps, value],
  );

  const runtimeQuickActions = useMemo(() => buildRuntimeQuickActions(currentPath), [currentPath]);
  const recentQuickActions = useMemo(() => buildRecentCommands(recentCommands), [recentCommands]);

  useEffect(() => {
    const container = historyContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (activeWindowId === windowId) {
      inputRef.current?.focus();
    }
  }, [activeWindowId, windowId]);

  useEffect(() => {
    let disposed = false;

    void loadRecentTerminalCommands().then((stored) => {
      if (disposed) {
        return;
      }

      setRecentCommands(stored);
      commandHistoryRef.current = stored;
    });

    const unsubscribe = subscribeToRecentTerminalCommands(() => {
      if (skipNextRecentCommandsSyncRef.current) {
        skipNextRecentCommandsSyncRef.current = false;
        return;
      }

      void loadRecentTerminalCommands().then((stored) => {
        if (disposed) {
          return;
        }

        setRecentCommands(stored);
        commandHistoryRef.current = stored;
      });
    });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, []);

  const applyRuntimeActions = useCallback(async (commandText: string) => {
    const runtime = getRuntimeSnapshot();
    const [command, target] = commandText.trim().split(/\s+/, 2);

    if (!command) {
      return;
    }

    if (command === "maximize") {
      const targetWindow = runtime.windows.find(
        (window) => window.id === target || window.id.startsWith(target ?? "") || window.appId === target,
      );

      if (targetWindow && !targetWindow.isMaximized) {
        maximizeWindowById(targetWindow.id);
      }

      return;
    }

    if (command === "restore") {
      const targetWindow = runtime.windows.find(
        (window) => window.id === target || window.id.startsWith(target ?? "") || window.appId === target,
      );

      if (!targetWindow) {
        return;
      }

      if (targetWindow.isMinimized) {
        restoreWindowById(targetWindow.id);
        return;
      }

      if (targetWindow.isMaximized) {
        maximizeWindowById(targetWindow.id);
      }

      return;
    }
  }, []);

  const executeCommand = useCallback(
    async (rawCommand?: string) => {
      const command = (rawCommand ?? value).trim();

      if (!command) {
        return;
      }

      const result = await runTerminalCommand(command, availableApps, currentPath, {
        runtime: getRuntimeSnapshot(),
      });
      const nextEntries: TerminalEntry[] = [];

      for (const maybeLine of result.output) {
        if (typeof maybeLine !== "string") {
          continue;
        }

        const normalized = maybeLine.toLowerCase();
        const kind: TerminalEntry["kind"] = normalized.includes("not found") || normalized.includes("unknown") || normalized.includes("ambiguous")
          ? "error"
          : "output";

        nextEntries.push(createTerminalEntry(kind, maybeLine));
      }

      setHistory((current) => [
        ...(result.clear ? [createTerminalEntry("system", `PortOS terminal ${processId.slice(0, 6)}`)] : current),
        createTerminalEntry("command", `${PROMPT_USER}:${currentPath}$ ${command}`),
        ...nextEntries,
      ]);
      setValue("");
      const nextRecentCommands = pushCommandHistory(commandHistoryRef.current, command);

      setRecentCommands(nextRecentCommands);
      commandHistoryRef.current = nextRecentCommands;
      skipNextRecentCommandsSyncRef.current = true;
      void saveRecentTerminalCommands(nextRecentCommands);
      setHistoryIndex(null);

      if (result.nextPath) {
        setCurrentPath(result.nextPath);
      }

      if (result.windowAction) {
        if (result.windowAction.type === "focus") {
          focusWindowById(result.windowAction.targetWindowId);
        }

        if (result.windowAction.type === "minimize") {
          minimizeWindowById(result.windowAction.targetWindowId);
        }

        if (result.windowAction.type === "close") {
          closeWindowById(result.windowAction.targetWindowId);
        }

        await applyRuntimeActions(`${result.windowAction.type} ${result.windowAction.targetWindowId}`);
      }

      if (result.processAction?.type === "terminate") {
        terminateProcessById(result.processAction.targetProcessId);
      }

      if (result.openAppId) {
        await openAppById(result.openAppId);
      }
    },
    [applyRuntimeActions, availableApps, currentPath, processId, value],
  );

  useEffect(() => {
    const applyExternalRequest = (request: TerminalExternalRequestDetail | null) => {
      if (!request || request.targetWindowId !== windowId) {
        return;
      }

      setBridgeStatus(buildTerminalBridgeMessage(request));
      setHistory((current) => [...current, createTerminalEntry("system", buildTerminalBridgeMessage(request))]);

      if (request.execute) {
        void executeCommand(request.command);
        return;
      }

      setValue(request.command);
      setHistoryIndex(null);
      inputRef.current?.focus();
    };

    const handleExternalRequest = (event: Event) => {
      applyExternalRequest((event as CustomEvent<TerminalExternalRequestDetail>).detail);
    };

    applyExternalRequest(readPendingTerminalExternalRequest(windowId));

    window.addEventListener(TERMINAL_EXTERNAL_REQUEST_EVENT, handleExternalRequest);

    return () => {
      window.removeEventListener(TERMINAL_EXTERNAL_REQUEST_EVENT, handleExternalRequest);
    };
  }, [executeCommand, windowId]);

  const applyQuickAction = (action: TerminalQuickAction, mode: "prefill" | "run") => {
    if (mode === "run") {
      void executeCommand(action.command);
      return;
    }

    setValue(action.command);
    setHistoryIndex(null);
    inputRef.current?.focus();
  };

  return (
    <div className="terminal-app flex h-full min-h-0 flex-col font-mono text-[#33ff00]">
      <div className="flex items-center justify-between border-b border-[#1f521f] bg-black px-4 py-3 text-xs uppercase tracking-[0.22em] text-[#8be870]">
        <div className="flex items-center gap-2">
          <MonitorCog className="h-4 w-4" strokeWidth={2} />
          <span>Terminal</span>
        </div>
        <span>{processId.slice(0, 6)}</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 border-t border-[#0a0a0a] lg:grid-cols-[minmax(0,1fr)_278px]">
        <div className="flex min-h-0 flex-col border-b border-[#1f521f] lg:border-b-0 lg:border-r">
          <div
            ref={historyContainerRef}
            id={`terminal-history-${processId}`}
            className="terminal-scroll min-h-0 flex-1 overflow-auto px-4 py-4 text-sm leading-6"
          >
            <div className="space-y-2">
              {history.map((entry) => (
                <p
                  key={entry.id}
                  className={cn(
                    entry.kind === "system" && "text-[#8be870]",
                    entry.kind === "command" && "text-[#33ff00]",
                    entry.kind === "output" && "text-[#b7ffab]",
                    entry.kind === "error" && "text-[#ff5555]",
                  )}
                >
                  {entry.text}
                </p>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1f521f] bg-[#050805] px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="pt-2 text-[#8be870]">{PROMPT_USER}:{currentPath}$</span>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setHistoryIndex(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void executeCommand();
                      return;
                    }

                    if (event.key === "Tab") {
                      event.preventDefault();

                      const suggestion = commandSuggestions[0];
                      if (suggestion) {
                        setValue(suggestion);
                      }
                      return;
                    }

                    if (event.key === "ArrowUp") {
                      event.preventDefault();

                      if (commandHistoryRef.current.length === 0) {
                        return;
                      }

                      setHistoryIndex((current) => {
                        const nextIndex = current == null
                          ? commandHistoryRef.current.length - 1
                          : Math.max(0, current - 1);

                        setValue(commandHistoryRef.current[nextIndex] ?? "");

                        return nextIndex;
                      });
                      return;
                    }

                    if (event.key === "ArrowDown") {
                      event.preventDefault();

                      if (commandHistoryRef.current.length === 0) {
                        return;
                      }

                      setHistoryIndex((current) => {
                        if (current == null) {
                          return null;
                        }

                        const nextIndex = current + 1;

                        if (nextIndex >= commandHistoryRef.current.length) {
                          setValue("");
                          return null;
                        }

                        setValue(commandHistoryRef.current[nextIndex] ?? "");
                        return nextIndex;
                      });
                    }
                  }}
                  className="w-full bg-transparent text-sm text-[#33ff00] outline-none placeholder:text-[#4a8742]"
                  placeholder="run a command"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                />

                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-[#8be870]">
                  {commandSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setValue(suggestion)}
                      className="cursor-pointer border border-[#1f521f] px-2 py-1 transition-all duration-200 hover:bg-[#33ff00] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33ff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void executeCommand()}
                className="terminal-action-button min-h-[44px] shrink-0 border border-[#33ff00] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                Run
              </button>
            </div>
          </div>
        </div>

        <aside className="terminal-side-panel terminal-scroll flex min-h-0 overflow-auto flex-col bg-[#040704] text-[#8be870]">
          <div className="border-b border-[#1f521f] px-4 py-3 text-xs uppercase tracking-[0.2em]">
            Session
          </div>
          <div className="space-y-4 px-4 py-4 text-sm leading-6">
            <SidePanel title="Quick Keys" icon={Command}>
              <PanelLine label="Enter" value="run command" />
              <PanelLine label="Tab" value="autocomplete" />
              <PanelLine label="Up/Down" value="history" />
            </SidePanel>

            <SidePanel title="Runtime" icon={Sparkles}>
              <PanelLine label="Apps" value={String(availableApps.length)} />
              <PanelLine label="Path" value={currentPath} />
              <PanelLine label="History" value={String(history.filter((entry) => entry.kind === "command").length)} />
            </SidePanel>

            <SidePanel title="Bridge" icon={Bolt}>
              <p className="text-xs uppercase tracking-[0.16em] text-[#b7ffab]">{bridgeStatus}</p>
            </SidePanel>

            <QuickActionPanel title="Recent" icon={History} actions={recentQuickActions} onAction={applyQuickAction} emptyLabel="No recent commands yet" />

            <QuickActionPanel title="Quick Run" icon={WandSparkles} actions={runtimeQuickActions} onAction={applyQuickAction} />

            <div className="border border-[#1f521f] px-3 py-3 text-xs uppercase tracking-[0.18em] text-[#33ff00] [text-shadow:0_0_5px_rgba(51,255,0,0.45)]">
              <div className="flex items-center gap-2">
                <CornerDownLeft className="h-4 w-4" strokeWidth={2} />
                Autoscroll active
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SidePanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Command;
  children: ReactNode;
}) {
  return (
    <div className="border border-[#1f521f] bg-black px-3 py-3 [text-shadow:0_0_5px_rgba(51,255,0,0.35)]">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#33ff00]">
        <Icon className="h-4 w-4" strokeWidth={2} />
        <span>{title}</span>
      </div>
      <div className="space-y-2 text-[#b7ffab]">{children}</div>
    </div>
  );
}

function QuickActionPanel({
  title,
  icon: Icon,
  actions,
  onAction,
  emptyLabel,
}: {
  title: string;
  icon: typeof Command;
  actions: TerminalQuickAction[];
  onAction: (action: TerminalQuickAction, mode: "prefill" | "run") => void;
  emptyLabel?: string;
}) {
  return (
    <div className="border border-[#1f521f] bg-black px-3 py-3 [text-shadow:0_0_5px_rgba(51,255,0,0.35)]">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#33ff00]">
        <Icon className="h-4 w-4" strokeWidth={2} />
        <span>{title}</span>
      </div>

      {actions.length === 0 ? (
        <p className="text-xs uppercase tracking-[0.16em] text-[#6fbf64]">{emptyLabel ?? "No actions available"}</p>
      ) : (
        <div className="space-y-2">
          {actions.map((action) => (
            <div key={action.id} className="terminal-quick-action border border-[#1f521f] p-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs uppercase tracking-[0.16em] text-[#33ff00]">{action.label}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#6fbf64]">{action.description}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onAction(action, "prefill")}
                    className="terminal-mini-button px-2 py-1 text-[10px] uppercase tracking-[0.16em]"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction(action, "run")}
                    className="terminal-mini-button terminal-mini-button--primary px-2 py-1 text-[10px] uppercase tracking-[0.16em]"
                  >
                    Run
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PanelLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs uppercase tracking-[0.16em]">
      <span className="text-[#8be870]">{label}</span>
      <span className="text-right text-[#b7ffab]">{value}</span>
    </div>
  );
}
