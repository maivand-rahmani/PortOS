"use client";

import { useMemo, useRef, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import { openAppById } from "@/shared/lib";
import { runTerminalCommand } from "@/shared/lib/app-logic";

export function TerminalApp({ processId }: AppComponentProps) {
  const apps = useOSStore((state) => state.apps);
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [history, setHistory] = useState<string[]>([
    `PortOS terminal ${processId.slice(0, 6)}`,
    "Type `help` to see available commands.",
  ]);
  const commandHistoryRef = useRef<string[]>([]);

  const availableApps = useMemo(
    () => apps.map((app) => ({ id: app.id, name: app.name })),
    [apps],
  );

  const runCommand = async () => {
    const command = value.trim();

    if (!command) {
      return;
    }

    const result = runTerminalCommand(command, availableApps, currentPath);

    setHistory((current) => [...current, `$ ${command}`, ...result.output]);
    setValue("");
    commandHistoryRef.current = [...commandHistoryRef.current, command];
    setHistoryIndex(null);

    if (result.nextPath) {
      setCurrentPath(result.nextPath);
    }

    const historyContainer = document.getElementById(`terminal-history-${processId}`);
    historyContainer?.scrollTo({ top: historyContainer.scrollHeight, behavior: "smooth" });

    if (result.openAppId) {
      await openAppById(result.openAppId);
    }
  };

  return (
    <div className="terminal-app flex h-full flex-col rounded-[24px] font-mono text-emerald-200">
      <div className="flex items-center justify-between rounded-t-[20px] bg-black px-4 py-3 text-xs uppercase tracking-[0.22em] text-emerald-300/72">
        <span>Terminal</span>
        <span>{processId.slice(0, 6)}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-b-[20px] bg-black px-4 py-4">
        <div id={`terminal-history-${processId}`} className="min-h-0 flex-1 space-y-2 overflow-auto text-sm leading-6">
          {history.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-emerald-400 pt-4">
          <span className="text-emerald-400">{currentPath} $</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void runCommand();
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
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-emerald-200"
            placeholder="run a command"
          />
          <button type="button" onClick={() => void runCommand()} className="cursor-pointer rounded-full border border-emerald-400 px-3 py-2 text-xs font-semibold text-emerald-200">
            Run
          </button>
        </div>
      </div>
    </div>
  );
}
