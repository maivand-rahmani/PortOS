"use client";

import {
  Activity,
  AppWindow,
  Layers3,
  Play,
  Sparkles,
  SquareStack,
  X,
} from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/shared/lib";
import { useOSStore } from "@/processes";

export function DesktopShell() {
  const apps = useOSStore((state) => state.apps);
  const appMap = useOSStore((state) => state.appMap);
  const windows = useOSStore((state) => state.windows);
  const processes = useOSStore((state) => state.processes);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const loadedApps = useOSStore((state) => state.loadedApps);
  const launchApp = useOSStore((state) => state.launchApp);
  const focusWindow = useOSStore((state) => state.focusWindow);
  const closeWindow = useOSStore((state) => state.closeWindow);
  const terminateProcess = useOSStore((state) => state.terminateProcess);

  const sortedWindows = useMemo(
    () => [...windows].sort((left, right) => left.zIndex - right.zIndex),
    [windows],
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-28 pt-4 text-foreground sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.2),transparent_56%)]" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/60 bg-window px-4 py-3 shadow-panel backdrop-blur-xl">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
            Portfolio OS
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            System core online
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Step 3 runtime
        </div>
      </header>

      <main className="mx-auto mt-6 flex w-full max-w-7xl flex-col gap-6">
        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-window border border-white/60 bg-window px-5 py-6 shadow-window backdrop-blur-xl sm:px-7 sm:py-8">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted">
              Operating system runtime
            </p>
            <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Window control, process tracking, and app loading now live in the OS layer.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              The runtime is now driven by a typed Zustand store. Launch the demo app
              below to verify the window manager, process manager, and app registry in a
              real UI.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void launchApp("system-overview")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Launch System Overview
              </button>
              <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/60 bg-surface px-4 py-3 text-sm font-medium text-muted">
                <Layers3 className="h-4 w-4 text-accent" aria-hidden="true" />
                {apps.length} registered app{apps.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <StatusCard
              icon={SquareStack}
              label="Open windows"
              value={String(windows.length)}
              tone="text-accent"
            />
            <StatusCard
              icon={Activity}
              label="Running processes"
              value={String(processes.length)}
              tone="text-accent-secondary"
            />
            <StatusCard
              icon={AppWindow}
              label="Active window"
              value={activeWindowId ? activeWindowId.slice(0, 8) : "None"}
              tone="text-foreground"
            />
          </section>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="relative min-h-[540px] overflow-hidden rounded-window border border-white/60 bg-surface p-4 shadow-window backdrop-blur-xl sm:p-5">
            <div className="flex h-full flex-col rounded-window border border-dashed border-white/60 bg-white/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                    Desktop surface
                  </p>
                  <p className="mt-2 text-sm font-medium text-muted">
                    Windows can be launched multiple times, focused to the front, and
                    closed from the runtime layer.
                  </p>
                </div>
              </div>

              <div className="relative mt-6 flex-1">
                {sortedWindows.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-window border border-white/60 bg-window/80 px-6 text-center shadow-panel">
                    <div>
                      <p className="font-display text-2xl font-bold text-foreground">
                        No windows open yet
                      </p>
                      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                        Launch the System Overview app from the button above or the dock to
                        boot the first window instance.
                      </p>
                    </div>
                  </div>
                ) : (
                  sortedWindows.map((window) => {
                    const app = appMap[window.appId];
                    const AppIcon = app.icon;
                    const AppComponent = loadedApps[window.appId];
                    const isActive = activeWindowId === window.id;

                    return (
                      <article
                        key={window.id}
                        className={cn(
                          "absolute inset-x-0 top-0 overflow-hidden rounded-window border bg-window shadow-window transition-transform duration-200 ease-out md:inset-auto",
                          isActive
                            ? "border-accent/35 ring-1 ring-accent/20"
                            : "border-white/70 opacity-95",
                        )}
                        style={{
                          left: `${window.position.x}px`,
                          top: `${window.position.y}px`,
                          zIndex: window.zIndex,
                          width: `min(${window.size.width}px, calc(100vw - 3rem))`,
                          height: `min(${window.size.height}px, calc(100vh - 16rem))`,
                        }}
                        onMouseDown={() => focusWindow(window.id)}
                      >
                        <header className="flex min-h-14 items-center justify-between border-b border-border/80 px-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                              <AppIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {window.title}
                              </p>
                              <p className="text-xs text-muted">
                                Process {window.processId.slice(0, 8)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            aria-label={`Close ${window.title}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              closeWindow(window.id);
                            }}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-black/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </header>

                        <div className="h-[calc(100%-3.5rem)] overflow-auto p-4 sm:p-5">
                          {AppComponent ? (
                            <AppComponent
                              processId={window.processId}
                              windowId={window.id}
                            />
                          ) : (
                            <p className="text-sm text-muted">
                              The app bundle is still loading.
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <aside className="rounded-window border border-white/60 bg-window px-4 py-5 shadow-window backdrop-blur-xl sm:px-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
              Process manager
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground">
              Active runtime processes
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Each launched window gets its own process entry so the OS layer can track the
              running app lifecycle independently of the UI shell.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {processes.length === 0 ? (
                <div className="rounded-panel border border-dashed border-white/60 bg-surface px-4 py-6 text-sm text-muted">
                  No running processes yet.
                </div>
              ) : (
                processes.map((process) => {
                  const app = appMap[process.appId];

                  return (
                    <div
                      key={process.id}
                      className="rounded-panel border border-white/60 bg-surface px-4 py-4 shadow-panel"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {app?.name ?? process.name}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            PID {process.id.slice(0, 8)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => terminateProcess(process.id)}
                          className="inline-flex min-h-11 items-center rounded-full border border-white/60 px-3 py-2 text-xs font-semibold text-foreground transition-colors duration-200 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          Terminate
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted">
                        Linked window {process.windowId?.slice(0, 8) ?? "pending"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </section>
      </main>

      <footer className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-full items-center gap-3 overflow-x-auto rounded-full border border-white/60 bg-window px-3 py-3 shadow-panel backdrop-blur-xl">
          {apps.map((app) => {
            const AppIcon = app.icon;
            const openWindows = windows.filter((window) => window.appId === app.id).length;

            return (
              <button
                key={app.id}
                type="button"
                onClick={() => void launchApp(app.id)}
                className="group flex min-h-11 min-w-[11rem] items-center gap-3 rounded-full px-3 py-2 text-left transition-colors duration-200 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                  <AppIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {app.name}
                  </span>
                  <span className="block text-xs text-muted">
                    {openWindows} open window{openWindows === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

type StatusCardProps = {
  icon: typeof Layers3;
  label: string;
  value: string;
  tone: string;
};

function StatusCard({ icon: Icon, label, value, tone }: StatusCardProps) {
  return (
    <article className="rounded-panel border border-white/60 bg-window px-4 py-4 shadow-panel backdrop-blur-xl sm:px-5">
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl bg-black/5",
          tone,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </article>
  );
}
