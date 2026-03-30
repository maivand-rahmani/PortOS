import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BatteryFull,
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

export function MacMenuBar({ statusBar, onRunAction, onOpenAgent }: MacMenuBarProps) {
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
    <header className="absolute inset-x-0 top-0 z-[600] flex h-[42px] items-center justify-between gap-3 border-b border-white/14 bg-[linear-gradient(180deg,rgba(21,27,38,0.72),rgba(14,18,27,0.54))] px-3 text-[13px] text-white shadow-[0_12px_48px_rgba(4,10,20,0.18)] backdrop-blur-2xl sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <motion.span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.45)]",
              statusBar.activeApp ? "bg-[#9cd2ff] shadow-[0_0_14px_rgba(88,190,255,0.65)]" : undefined,
            )}
            animate={shouldReduceMotion ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          />
          <span className="max-w-[8.5rem] truncate font-semibold tracking-tight sm:max-w-none">
            {statusBar.title}
          </span>
        </div>

        {compactAction ? (
          <button
            type="button"
            className="inline-flex h-7 max-w-[10.5rem] items-center rounded-full border border-white/14 bg-white/8 px-3 text-[11px] font-medium text-white/88 transition-colors duration-200 hover:bg-white/14 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 md:hidden"
            title={compactAction.info ?? compactAction.sectionLabel}
            onClick={() => onRunAction?.(compactAction.id)}
          >
            <span className="truncate">{compactAction.label}</span>
          </button>
        ) : (
          <span
            className="inline-flex h-7 max-w-[11rem] items-center rounded-full border border-white/12 bg-white/7 px-3 text-[11px] text-white/68 md:hidden"
            title={contextInfo}
          >
            <span className="truncate">{contextInfo}</span>
          </span>
        )}

        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden md:flex">
          {menuActions.length > 0 ? (
            menuActions.map((action, index) => {
              const showSeparator = index > 0 && action.sectionId !== menuActions[index - 1]?.sectionId;

              return (
                <div key={action.id} className="flex min-w-0 shrink-0 items-center gap-1">
                  {showSeparator ? <span className="text-white/28">/</span> : null}
                  <button
                    type="button"
                    className="inline-flex h-7 items-center rounded-full px-2.5 text-white/82 transition-colors duration-200 hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
                    title={action.info ?? action.sectionLabel}
                    onClick={() => onRunAction?.(action.id)}
                  >
                    {action.label}
                  </button>
                </div>
              );
            })
          ) : (
            <span className="truncate text-white/64">{contextInfo}</span>
          )}
        </nav>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`${statusBar.title}:${contextInfo}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="hidden min-w-0 max-w-[18rem] truncate rounded-full border border-white/12 bg-white/7 px-3 py-1 text-[11px] text-white/68 xl:block"
            title={contextInfo}
          >
            {contextInfo}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 text-white/86 sm:gap-2">
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/14 bg-white/10 px-2.5 text-white transition-colors duration-200 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
          title="Open Maivand AI agent"
          aria-label="Open Maivand AI agent"
          onClick={onOpenAgent}
        >
          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Maivand</span>
        </button>

        {processStatus ? (
          <span
            className="hidden rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-[11px] text-white/70 lg:inline-flex"
            title={processStatus.info}
          >
            {processStatus.label}
          </span>
        ) : null}

        {BASE_INDICATORS.map(({ id, icon: Icon, label, info }) => (
          <span
            key={id}
            className="inline-flex h-7 items-center gap-1 rounded-full px-1.5 text-white/74 transition-colors duration-200 hover:text-white"
            title={info}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden text-[11px] sm:inline">{label}</span>
          </span>
        ))}

        <span className="rounded-full border border-white/12 bg-white/9 px-2.5 py-1 text-[11px] font-medium text-white/90 sm:hidden">
          {clock.compactLabel}
        </span>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-white/66">{clock.dateLabel}</span>
          <span className="rounded-full border border-white/12 bg-white/9 px-2.5 py-1 text-[11px] font-medium text-white/92">
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
