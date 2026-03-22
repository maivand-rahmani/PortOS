"use client";

import {
  Activity,
  BatteryFull,
  ChevronDown,
  Maximize2,
  Minus,
  MonitorSmartphone,
  Search,
  Wifi,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";
import { useOSStore } from "@/processes";
import { cn } from "@/shared/lib";

const DESKTOP_INSETS = {
  top: 42,
  right: 24,
  bottom: 120,
  left: 24,
} as const;

const BOOT_SEQUENCE = [18, 39, 63, 82, 100];

export function DesktopShell() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [desktopBounds, setDesktopBounds] = useState<DesktopBounds | null>(null);
  const [selectedDesktopAppId, setSelectedDesktopAppId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const apps = useOSStore((state) => state.apps);
  const appMap = useOSStore((state) => state.appMap);
  const windows = useOSStore((state) => state.windows);
  const processes = useOSStore((state) => state.processes);
  const loadedApps = useOSStore((state) => state.loadedApps);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const bootPhase = useOSStore((state) => state.bootPhase);
  const bootProgress = useOSStore((state) => state.bootProgress);

  const setBootProgress = useOSStore((state) => state.setBootProgress);
  const completeBoot = useOSStore((state) => state.completeBoot);
  const activateApp = useOSStore((state) => state.activateApp);
  const focusWindow = useOSStore((state) => state.focusWindow);
  const closeWindow = useOSStore((state) => state.closeWindow);
  const minimizeWindow = useOSStore((state) => state.minimizeWindow);
  const restoreWindow = useOSStore((state) => state.restoreWindow);
  const toggleWindowMaximize = useOSStore((state) => state.toggleWindowMaximize);
  const beginWindowDrag = useOSStore((state) => state.beginWindowDrag);
  const updateWindowDrag = useOSStore((state) => state.updateWindowDrag);
  const endWindowDrag = useOSStore((state) => state.endWindowDrag);
  const resizeWindowsToBounds = useOSStore((state) => state.resizeWindowsToBounds);

  const visibleWindows = useMemo(
    () =>
      [...windows]
        .filter((window) => !window.isMinimized)
        .sort((left, right) => left.zIndex - right.zIndex),
    [windows],
  );

  useEffect(() => {
    if (!shellRef.current) {
      return undefined;
    }

    const calculateBounds = () => {
      if (!shellRef.current) {
        return;
      }

      const rect = shellRef.current.getBoundingClientRect();

      setDesktopBounds({
        width: rect.width,
        height: rect.height,
        insetTop: DESKTOP_INSETS.top,
        insetRight: DESKTOP_INSETS.right,
        insetBottom: DESKTOP_INSETS.bottom,
        insetLeft: DESKTOP_INSETS.left,
      });
    };

    calculateBounds();

    const observer = new ResizeObserver(() => {
      calculateBounds();
    });

    observer.observe(shellRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!desktopBounds) {
      return;
    }

    resizeWindowsToBounds(desktopBounds);
  }, [desktopBounds, resizeWindowsToBounds]);

  useEffect(() => {
    if (bootPhase !== "booting") {
      return undefined;
    }

    let stepIndex = 0;

    const advanceBoot = () => {
      const progress = BOOT_SEQUENCE[stepIndex];

      if (progress === undefined) {
        completeBoot();

        return;
      }

      setBootProgress(progress);
      stepIndex += 1;
    };

    advanceBoot();

    const intervalId = window.setInterval(
      advanceBoot,
      shouldReduceMotion ? 90 : 260,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [bootPhase, completeBoot, setBootProgress, shouldReduceMotion]);

  useEffect(() => {
    if (!desktopBounds) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      updateWindowDrag(
        {
          x: event.clientX,
          y: event.clientY,
        },
        desktopBounds,
      );
    };

    const handlePointerUp = () => {
      endWindowDrag();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [desktopBounds, endWindowDrag, updateWindowDrag]);

  const launchFromSurface = (appId: string) => {
    if (!desktopBounds) {
      return;
    }

    setSelectedDesktopAppId(appId);
    void activateApp(appId, desktopBounds);
  };

  return (
    <div
      ref={shellRef}
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
    >
      <DesktopWallpaper />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(10,132,255,0.18),transparent_30%)]" />

      <MacMenuBar processCount={processes.length} />

      <main className="relative h-screen w-full">
        <DesktopIcons
          apps={apps}
          selectedAppId={selectedDesktopAppId}
          onSelectApp={setSelectedDesktopAppId}
          onOpenApp={launchFromSurface}
        />

        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {visibleWindows.map((window) => {
              const app = appMap[window.appId];
              const AppComponent = loadedApps[window.appId];

              if (!app) {
                return null;
              }

              return (
                <WindowSurface
                  key={window.id}
                  window={window}
                  isActive={window.id === activeWindowId}
                  onFocus={() => focusWindow(window.id)}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onToggleMaximize={() => {
                    if (!desktopBounds) {
                      return;
                    }

                    toggleWindowMaximize(window.id, desktopBounds);
                  }}
                  onDragStart={(pointer) => beginWindowDrag(window.id, pointer)}
                >
                  {AppComponent ? (
                    <AppComponent processId={window.processId} windowId={window.id} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted">
                      Loading application...
                    </div>
                  )}
                </WindowSurface>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <MacDock
        apps={apps}
        windows={windows}
        onActivateApp={launchFromSurface}
        onRestoreWindow={restoreWindow}
      />

      <AnimatePresence>
        {bootPhase === "booting" ? <BootOverlay progress={bootProgress} /> : null}
      </AnimatePresence>
    </div>
  );
}

function DesktopWallpaper() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#d6dbe8_0%,#b7c3da_18%,#7d93bb_38%,#53688f_57%,#1f3154_82%,#0b1628_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.42),transparent_18%),radial-gradient(circle_at_74%_22%,rgba(255,255,255,0.18),transparent_16%),radial-gradient(circle_at_50%_100%,rgba(106,162,255,0.35),transparent_38%)]" />
      <div className="absolute left-[-12%] top-[12%] h-[24rem] w-[24rem] rounded-full bg-white/12 blur-3xl" />
      <div className="absolute bottom-[-14%] right-[-8%] h-[28rem] w-[28rem] rounded-full bg-sky-300/18 blur-3xl" />
    </div>
  );
}

type MacMenuBarProps = {
  processCount: number;
};

function MacMenuBar({ processCount }: MacMenuBarProps) {
  const time = useCurrentTime();

  return (
    <header className="absolute inset-x-0 top-0 z-[600] flex h-9 items-center justify-between border-b border-white/10 bg-black/25 px-3 text-[13px] text-white shadow-[0_10px_40px_rgba(4,10,20,0.18)] backdrop-blur-xl sm:px-5">
      <div className="flex items-center gap-4">
        <span className="font-semibold tracking-tight">PortOS</span>
        <nav className="hidden items-center gap-4 text-white/88 md:flex">
          <span>Finder</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-white/88">
        <span className="hidden items-center gap-1 md:flex">
          <MonitorSmartphone className="h-3.5 w-3.5" aria-hidden="true" />
          {processCount} Active
        </span>
        <Search className="h-4 w-4" aria-hidden="true" />
        <Wifi className="h-4 w-4" aria-hidden="true" />
        <BatteryFull className="h-4 w-4" aria-hidden="true" />
        <span>{time}</span>
      </div>
    </header>
  );
}

type DesktopIconsProps = {
  apps: ReturnType<typeof useOSStore.getState>["apps"];
  selectedAppId: string | null;
  onSelectApp: (appId: string | null) => void;
  onOpenApp: (appId: string) => void;
};

function DesktopIcons({
  apps,
  selectedAppId,
  onSelectApp,
  onOpenApp,
}: DesktopIconsProps) {
  return (
    <div className="absolute inset-x-0 top-11 bottom-28 z-10 px-4 py-5 sm:px-6">
      <div className="grid max-w-[8rem] gap-3 sm:max-w-[10rem]">
        {apps.map((app) => {
          const Icon = app.icon;

          return (
            <button
              key={app.id}
              type="button"
              onDoubleClick={() => onOpenApp(app.id)}
              onClick={() => onSelectApp(app.id)}
              className={cn(
                "group flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-3xl border px-3 py-3 text-center text-white/92 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
                selectedAppId === app.id
                  ? "border-white/30 bg-white/16"
                  : "border-transparent bg-white/5",
              )}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/30 bg-white/18 shadow-[0_16px_30px_rgba(10,15,30,0.25)] backdrop-blur-xl">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium leading-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type WindowSurfaceProps = {
  window: WindowInstance;
  isActive: boolean;
  children: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onDragStart: (pointer: WindowPosition) => void;
};

function WindowSurface({
  window,
  isActive,
  children,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onDragStart,
}: WindowSurfaceProps) {
  return (
    <motion.article
      layout={!window.isMaximized}
      initial={{ opacity: 0, scale: 0.98, y: 18 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.96, y: 22 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={cn(
        "pointer-events-auto absolute overflow-hidden rounded-[30px] border border-white/45 bg-window shadow-[0_36px_90px_rgba(6,12,24,0.34)] backdrop-blur-2xl",
        isActive ? "ring-1 ring-white/40" : "opacity-[0.985] saturate-[0.92]",
      )}
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={onFocus}
    >
      <header
        className="flex h-14 cursor-grab items-center justify-between border-b border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,246,251,0.74))] px-4 active:cursor-grabbing"
        onDoubleClick={(event) => {
          event.stopPropagation();
          onToggleMaximize();
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return;
          }

          onDragStart({
            x: event.clientX,
            y: event.clientY,
          });
        }}
      >
        <div className="flex items-center gap-2">
          <WindowTrafficButton
            tone="red"
            icon={<X className="h-2.5 w-2.5" aria-hidden="true" />}
            label={`Close ${window.title}`}
            onClick={onClose}
          />
          <WindowTrafficButton
            tone="yellow"
            icon={<Minus className="h-2.5 w-2.5" aria-hidden="true" />}
            label={`Minimize ${window.title}`}
            onClick={onMinimize}
          />
          <WindowTrafficButton
            tone="green"
            icon={<Maximize2 className="h-2.5 w-2.5" aria-hidden="true" />}
            label={`Toggle maximize ${window.title}`}
            onClick={onToggleMaximize}
          />
        </div>

        <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground/88">
          <span>{window.title}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        </div>

        <div className="w-[4.5rem]" />
      </header>

      <div className="h-[calc(100%-3.5rem)] overflow-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,247,252,0.92))] p-4 sm:p-5">
        {children}
      </div>
    </motion.article>
  );
}

type WindowTrafficButtonProps = {
  tone: "red" | "yellow" | "green";
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function WindowTrafficButton({ tone, icon, label, onClick }: WindowTrafficButtonProps) {
  const tones = {
    red: "bg-[#ff5f57] text-[#6f120d]",
    yellow: "bg-[#febc2e] text-[#6e4a03]",
    green: "bg-[#28c840] text-[#0e5420]",
  };

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black/10 text-[0] transition duration-150 hover:text-[10px]",
        tones[tone],
      )}
    >
      {icon}
    </button>
  );
}

type MacDockProps = {
  apps: ReturnType<typeof useOSStore.getState>["apps"];
  windows: WindowInstance[];
  onActivateApp: (appId: string) => void;
  onRestoreWindow: (windowId: string) => void;
};

function MacDock({ apps, windows, onActivateApp, onRestoreWindow }: MacDockProps) {
  const minimizedWindows = windows.filter((window) => window.isMinimized);

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-4 z-[500] flex justify-center px-4">
      <div className="pointer-events-auto flex items-end gap-3 rounded-[28px] border border-white/26 bg-white/18 px-4 py-3 shadow-[0_30px_60px_rgba(8,14,26,0.24)] backdrop-blur-2xl">
        {apps.map((app) => {
          const Icon = app.icon;
          const activeCount = windows.filter(
            (window) => window.appId === app.id && !window.isMinimized,
          ).length;

          return (
            <button
              key={app.id}
              type="button"
              onClick={() => onActivateApp(app.id)}
              className="group relative flex flex-col items-center gap-2 rounded-2xl px-1 pb-1 pt-0 text-white transition duration-200 hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="pointer-events-none absolute -top-10 rounded-xl bg-black/65 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                {app.name}
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/28 bg-white/22 shadow-[0_12px_24px_rgba(12,18,30,0.26)] backdrop-blur-xl">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-white/90 transition-opacity",
                  activeCount > 0 ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}

        {minimizedWindows.length > 0 ? (
          <div className="mx-1 h-12 w-px bg-white/25" />
        ) : null}

        {minimizedWindows.map((window) => {
          const app = apps.find((item) => item.id === window.appId);
          const AppIcon = app?.icon ?? Activity;

          return (
            <button
              key={window.id}
              type="button"
              onClick={() => onRestoreWindow(window.id)}
              className="group relative flex flex-col items-center gap-2 rounded-2xl px-1 pb-1 pt-0 text-white transition duration-200 hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="pointer-events-none absolute -top-10 rounded-xl bg-black/65 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                Restore {window.title}
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/28 bg-white/16 shadow-[0_12px_24px_rgba(12,18,30,0.26)] backdrop-blur-xl">
                <AppIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}

type BootOverlayProps = {
  progress: number;
};

function BootOverlay({ progress }: BootOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
      className="absolute inset-0 z-[900] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(48,76,126,0.85),rgba(8,12,20,0.96)_62%)]"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex w-[min(24rem,calc(100vw-2.5rem))] flex-col items-center rounded-[32px] border border-white/10 bg-white/8 px-6 py-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-3xl"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/20 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <MonitorSmartphone className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-bold tracking-tight">PortOS</h1>
        <p className="mt-2 text-sm text-white/72">Booting the portfolio desktop environment</p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/12">
          <motion.div
            className="h-full rounded-full bg-white"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          />
        </div>

        <p className="mt-3 text-xs tracking-[0.18em] text-white/62">{progress}% READY</p>
      </motion.div>
    </motion.div>
  );
}

function useCurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const update = () => {
      setTime(formatter.format(new Date()));
    };

    update();

    const intervalId = window.setInterval(update, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return time;
}
