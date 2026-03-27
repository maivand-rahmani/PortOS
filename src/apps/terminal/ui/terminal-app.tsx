"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Command, CornerDownLeft, History, MonitorCog, Sparkles } from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import { cn, getRuntimeSnapshot, openAppById } from "@/shared/lib";
import { runTerminalCommand } from "@/shared/lib/app-logic";

type TerminalEntry = {
  id: string;
  kind: "system" | "command" | "output" | "error";
  text: string;
};

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
  "ps",
  "windows",
  "sysinfo",
] as const;

export function TerminalApp({ processId }: AppComponentProps) {
  const apps = useOSStore((state) => state.apps);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [history, setHistory] = useState<TerminalEntry[]>([
    createEntry("system", `PortOS terminal ${processId.slice(0, 6)}`),
    createEntry("system", "Type `help` to see available commands."),
  ]);
  const commandHistoryRef = useRef<string[]>([]);
  const historyContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const availableApps = useMemo(
    () => apps.map((app) => ({ id: app.id, name: app.name })),
    [apps],
  );

  const commandSuggestions = useMemo(() => {
    const allCommands = [...BASE_COMMANDS, ...availableApps.map((app) => `open ${app.id}`)];
    const query = value.trim().toLowerCase();

    if (!query) {
      return allCommands.slice(0, 6);
    }

    return allCommands.filter((item) => item.startsWith(query)).slice(0, 6);
  }, [availableApps, value]);

  useEffect(() => {
    const container = historyContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeWindowId]);

  const runCommand = async () => {
    const command = value.trim();

    if (!command) {
      return;
    }

    const result = runTerminalCommand(command, availableApps, currentPath, {
      runtime: getRuntimeSnapshot(),
    });

    const nextEntries = result.output.map((line) =>
      createEntry(line.toLowerCase().includes("not found") || line.toLowerCase().includes("unknown") ? "error" : "output", line),
    );

    setHistory((current) => [
      ...(result.clear
        ? [createEntry("system", `PortOS terminal ${processId.slice(0, 6)}`)]
        : current),
      createEntry("command", `${PROMPT_USER}:${currentPath}$ ${command}`),
      ...nextEntries,
    ]);
    setValue("");
    commandHistoryRef.current = [...commandHistoryRef.current, command];
    setHistoryIndex(null);

    if (result.nextPath) {
      setCurrentPath(result.nextPath);
    }

    if (result.openAppId) {
      await openAppById(result.openAppId);
    }
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
      <div className="grid min-h-0 flex-1 grid-cols-1 border-t border-[#0a0a0a] lg:grid-cols-[minmax(0,1fr)_250px]">
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
                      void runCommand();
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
                onClick={() => void runCommand()}
                className="terminal-action-button min-h-[44px] shrink-0 border border-[#33ff00] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                Run
              </button>
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 overflow-auto flex-col bg-[#040704] text-[#8be870]">
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

function PanelLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs uppercase tracking-[0.16em]">
      <span className="text-[#8be870]">{label}</span>
      <span className="text-right text-[#b7ffab]">{value}</span>
    </div>
  );
}

function createEntry(kind: TerminalEntry["kind"], text: string): TerminalEntry {
  return {
    id: crypto.randomUUID(),
    kind,
    text,
  };
}
