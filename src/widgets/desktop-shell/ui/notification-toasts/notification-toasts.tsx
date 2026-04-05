"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  TriangleAlert,
  X,
} from "lucide-react";

import type { AppConfigMap } from "@/entities/app";
import type { OSNotification } from "@/processes";
import { cn } from "@/shared/lib/cn/cn";

type NotificationToastsProps = {
  toasts: OSNotification[];
  appMap: AppConfigMap;
  onDismiss: (notificationId: string) => void;
  onOpenCenter: () => void;
};

const LEVEL_STYLES = {
  info: {
    icon: Bell,
    iconClassName: "text-sky-400",
    glowClassName: "from-sky-400/20",
  },
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-400",
    glowClassName: "from-emerald-400/20",
  },
  warning: {
    icon: TriangleAlert,
    iconClassName: "text-amber-400",
    glowClassName: "from-amber-400/20",
  },
  error: {
    icon: AlertCircle,
    iconClassName: "text-rose-400",
    glowClassName: "from-rose-400/20",
  },
} as const;

export function NotificationToasts({
  toasts,
  appMap,
  onDismiss,
  onOpenCenter,
}: NotificationToastsProps) {
  return (
    <div className="pointer-events-none fixed right-5 top-11 z-[9800] flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((notification) => {
          const levelStyle = LEVEL_STYLES[notification.level];
          const Icon = levelStyle.icon;
          const sourceLabel = notification.appId
            ? appMap[notification.appId]?.name ?? notification.appId
            : "System";

          return (
            <motion.article
              key={notification.id}
              initial={{ opacity: 0, x: 28, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl border border-white/14 bg-[linear-gradient(180deg,rgba(26,26,29,0.88),rgba(14,14,18,0.82))] shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%)]",
                  levelStyle.glowClassName,
                )}
              />

              <button
                type="button"
                className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/8 hover:text-white/86"
                onClick={() => onDismiss(notification.id)}
                aria-label={`Dismiss ${notification.title}`}
              >
                <X className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                onClick={onOpenCenter}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/8 ring-1 ring-white/10">
                  <Icon className={cn("h-4.5 w-4.5", levelStyle.iconClassName)} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex items-center gap-2 pr-8 text-[11px] uppercase tracking-[0.14em] text-white/45">
                    <span>{sourceLabel}</span>
                    <span className="h-1 w-1 rounded-full bg-white/18" />
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                  </span>
                  <span className="block truncate text-[13px] font-semibold text-white/94">
                    {notification.title}
                  </span>
                  {notification.body ? (
                    <span className="mt-1 block text-[12px] leading-5 text-white/65">
                      {notification.body}
                    </span>
                  ) : null}
                </span>
              </button>
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const deltaSeconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));

  if (deltaSeconds < 10) return "now";
  if (deltaSeconds < 60) return `${deltaSeconds}s`;

  const minutes = Math.round(deltaSeconds / 60);

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.round(minutes / 60);

  if (hours < 24) return `${hours}h`;

  const days = Math.round(hours / 24);

  return `${days}d`;
}
