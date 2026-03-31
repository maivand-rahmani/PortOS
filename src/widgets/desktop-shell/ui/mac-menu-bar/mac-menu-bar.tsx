import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AppWindow,
  BatteryFull,
  Bell,
  Bot,
  Volume2,
  Wifi,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/shared/lib/cn";

import type { StatusBarModel } from "../../model/status-bar";

type MacMenuBarProps = {
  statusBar: StatusBarModel;
  onRunAction?: (actionId: string) => void;
  onOpenAgent?: () => void;
  notificationCount?: number;
  onToggleNotifications?: () => void;
  onOpenAppSwitcher?: () => void;
};

type MenuBarAction = {
  id: string;
  label: string;
  info?: string;
  sectionId: string;
  sectionLabel: string;
};

const COMPACT_CLOCK_FALLBACK = "-- --, --:--";
const TIME_FALLBACK = "--:--";
const DESKTOP_FALLBACK = "Desktop ready";

const BASE_INDICATORS = [
  {
    id: "sound",
    icon: Volume2,
    label: "72%",
    info: "Output volume set to 72%.",
  },
  {
    id: "wifi",
    icon: Wifi,
    label: "WiFi",
    info: "Connected to Portfolio OS network.",
  },
  {
    id: "battery",
    icon: BatteryFull,
    label: "96%",
    info: "Battery is mocked at 96%.",
  },
] as const;

export function MacMenuBar({
  statusBar,
  onRunAction,
  onOpenAgent,
  notificationCount = 0,
  onToggleNotifications,
  onOpenAppSwitcher,
}: MacMenuBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const clock = useStatusClock();
  const menuActions = useMemo<MenuBarAction[]>(
    () =>
      statusBar.menu?.sections.flatMap((section) =>
        section.actions.map((action) => ({
          id: action.id,
          label: action.label,
          info: action.info,
          sectionId: section.id,
          sectionLabel: section.label,
        })),
      ) ?? [],
    [statusBar.menu],
  );
  const compactAction = menuActions[0] ?? null;
  const processStatus = statusBar.systemItems[0];
  const contextInfo = statusBar.info ?? DESKTOP_FALLBACK;

  return (
    <header className="absolute inset-x-0 top-0 z-[600] flex h-7 items-center justify-between gap-3 border-b border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.14))] px-2.5 text-[12px] text-black/85 shadow-[inset_0_-1px_0_rgba(255,255,255,0.2),0_1px_18px_rgba(15,23,42,0.12)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,18,20,0.4),rgba(18,18,20,0.22))] dark:text-white/92 sm:px-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 items-center justify-center rounded-md text-[14px] font-semibold text-inherit"
          >
            
          </span>
          <span className="max-w-[7rem] truncate font-semibold tracking-[-0.01em] sm:max-w-none">
            {statusBar.title}
          </span>
        </div>

        {compactAction ? (
          <button
            type="button"
            className="inline-flex h-5 max-w-[9rem] items-center rounded-md px-2 text-[11px] font-medium text-inherit/90 transition-colors duration-150 hover:bg-black/8 hover:text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:hover:bg-white/12 dark:focus-visible:ring-white/25 md:hidden"
            title={compactAction.info ?? compactAction.sectionLabel}
            onClick={() => onRunAction?.(compactAction.id)}
          >
            <span className="truncate">{compactAction.label}</span>
          </button>
        ) : (
          <span
            className="inline-flex h-5 max-w-[9.5rem] items-center rounded-md px-2 text-[11px] text-inherit/60 md:hidden"
            title={contextInfo}
          >
            <span className="truncate">{contextInfo}</span>
          </span>
        )}

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-hidden md:flex">
          {menuActions.length > 0 ? (
            menuActions.map((action, index) => {
              const showSeparator = index > 0 && action.sectionId !== menuActions[index - 1]?.sectionId;

              return (
                <div key={action.id} className="flex min-w-0 shrink-0 items-center gap-0.5">
                  {showSeparator ? <span className="mx-0.5 text-inherit/20">•</span> : null}
                  <button
                    type="button"
                    className="inline-flex h-5 items-center rounded-md px-2 text-[12px] font-medium text-inherit/88 transition-colors duration-150 hover:bg-black/8 hover:text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:hover:bg-white/12 dark:focus-visible:ring-white/25"
                    title={action.info ?? action.sectionLabel}
                    onClick={() => onRunAction?.(action.id)}
                  >
                    {action.label}
                  </button>
                </div>
              );
            })
          ) : (
            <span className="truncate text-inherit/60">{contextInfo}</span>
          )}
        </nav>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`${statusBar.title}:${contextInfo}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="hidden min-w-0 max-w-[16rem] truncate rounded-md px-2 py-0.5 text-[11px] text-inherit/54 xl:block"
            title={contextInfo}
          >
            {contextInfo}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 text-inherit sm:gap-1">
        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded-md text-inherit/88 transition-colors duration-150 hover:bg-black/8 hover:text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:hover:bg-white/12 dark:focus-visible:ring-white/25"
          title="Open Maivand AI agent"
          aria-label="Open Maivand AI agent"
          onClick={onOpenAgent}
        >
          <Bot className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded-md text-inherit/88 transition-colors duration-150 hover:bg-black/8 hover:text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:hover:bg-white/12 dark:focus-visible:ring-white/25"
          title="Open app switcher"
          aria-label="Open app switcher"
          onClick={onOpenAppSwitcher}
        >
          <AppWindow className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="relative inline-flex h-5 w-5 items-center justify-center rounded-md text-inherit/88 transition-colors duration-150 hover:bg-black/8 hover:text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:hover:bg-white/12 dark:focus-visible:ring-white/25"
          title={
            notificationCount > 0
              ? `${notificationCount} unread notification${notificationCount === 1 ? "" : "s"}`
              : "Open notification center"
          }
          aria-label="Open notification center"
          onClick={onToggleNotifications}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {notificationCount > 0 ? (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
          ) : null}
        </button>

        {processStatus ? (
          <span
            className="hidden rounded-md px-2 py-0.5 text-[11px] text-inherit/58 lg:inline-flex"
            title={processStatus.info}
          >
            {processStatus.label}
          </span>
        ) : null}

        {BASE_INDICATORS.map(({ id, icon: Icon, label, info }) => (
          <span
            key={id}
            className="inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-inherit/78 transition-colors duration-150 hover:bg-black/8 hover:text-inherit dark:hover:bg-white/12"
            title={info}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden text-[11px] font-medium md:inline">{label}</span>
          </span>
        ))}

        <span className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-inherit/90 sm:hidden">
          {clock.compactLabel}
        </span>

        <div className="hidden items-center gap-2 pl-1 sm:flex">
          <span className="text-[11px] font-medium text-inherit/64">{clock.dateLabel}</span>
          <span className="text-[12px] font-medium tracking-[0.01em] text-inherit/92">
            {clock.timeLabel}
          </span>
        </div>
      </div>
    </header>
  );
}

type StatusClockState = {
  compactLabel: string;
  dateLabel: string;
  timeLabel: string;
};

function useStatusClock(): StatusClockState {
  const [clock, setClock] = useState<StatusClockState>({
    compactLabel: COMPACT_CLOCK_FALLBACK,
    dateLabel: COMPACT_CLOCK_FALLBACK.split(", ")[0] ?? COMPACT_CLOCK_FALLBACK,
    timeLabel: TIME_FALLBACK,
  });

  useEffect(() => {
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const compactFormatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const update = () => {
      const now = new Date();

      setClock({
        compactLabel: compactFormatter.format(now),
        dateLabel: dateFormatter.format(now),
        timeLabel: timeFormatter.format(now),
      });
    };

    update();

    const intervalId = window.setInterval(update, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return clock;
}
