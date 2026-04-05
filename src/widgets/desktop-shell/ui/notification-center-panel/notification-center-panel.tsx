"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Inbox,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import type { AppConfigMap } from "@/entities/app";
import type { OSNotification } from "@/processes";
import { cn } from "@/shared/lib/cn/cn";

type NotificationCenterPanelProps = {
  isOpen: boolean;
  notifications: OSNotification[];
  unreadCount: number;
  appMap: AppConfigMap;
  onClose: () => void;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onRemove: (notificationId: string) => void;
  onClearAll: () => void;
};

const LEVEL_META = {
  info: { icon: Bell, iconClassName: "text-sky-400" },
  success: { icon: CheckCircle2, iconClassName: "text-emerald-400" },
  warning: { icon: TriangleAlert, iconClassName: "text-amber-400" },
  error: { icon: AlertCircle, iconClassName: "text-rose-400" },
} as const;

export function NotificationCenterPanel({
  isOpen,
  notifications,
  unreadCount,
  appMap,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onRemove,
  onClearAll,
}: NotificationCenterPanelProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9600] bg-transparent"
            onClick={onClose}
          />

          <motion.aside
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="fixed right-4 top-10 z-[9700] flex h-[min(42rem,calc(100vh-4rem))] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(20,20,23,0.86),rgba(12,12,15,0.82))] shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-3xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-4">
              <div>
                <div className="text-[15px] font-semibold text-white/95">Notification Center</div>
                <div className="mt-1 text-[12px] text-white/48">
                  {unreadCount > 0
                    ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                    : "Everything is up to date"}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 text-[11px] font-medium text-white/72 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={onMarkAllRead}
                  disabled={notifications.length === 0 || unreadCount === 0}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/54 transition-colors hover:bg-white/10 hover:text-white"
                  onClick={onClose}
                  aria-label="Close notification center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {notifications.length > 0 ? (
              <div className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-white/36">
                <span>Recent</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-white/44 transition-colors hover:text-white/72"
                  onClick={onClearAll}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              {notifications.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {notifications.map((notification) => {
                    const levelMeta = LEVEL_META[notification.level];
                    const Icon = levelMeta.icon;
                    const sourceLabel = notification.appId
                      ? appMap[notification.appId]?.name ?? notification.appId
                      : "System";

                    return (
                      <article
                        key={notification.id}
                        className={cn(
                          "relative overflow-hidden rounded-2xl border px-3.5 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-colors",
                          notification.isRead
                            ? "border-white/8 bg-white/[0.045]"
                            : "border-white/14 bg-white/[0.085]",
                        )}
                      >
                        {!notification.isRead ? (
                          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-sky-400/90 shadow-[0_0_16px_rgba(56,189,248,0.7)]" />
                        ) : null}

                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/7 ring-1 ring-white/10">
                            <Icon className={cn("h-4.5 w-4.5", levelMeta.iconClassName)} />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.13em] text-white/38">
                              <span>{sourceLabel}</span>
                              <span className="h-1 w-1 rounded-full bg-white/18" />
                              <span>{formatTimestamp(notification.createdAt)}</span>
                            </div>
                            <h3 className="truncate text-[13px] font-semibold text-white/94">
                              {notification.title}
                            </h3>
                            {notification.body ? (
                              <p className="mt-1 text-[12px] leading-5 text-white/62">
                                {notification.body}
                              </p>
                            ) : null}

                            <div className="mt-3 flex items-center gap-2">
                              {!notification.isRead ? (
                                <button
                                  type="button"
                                  className="rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-[11px] font-medium text-white/74 transition-colors hover:bg-white/10 hover:text-white"
                                  onClick={() => onMarkRead(notification.id)}
                                >
                                  Mark read
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white/46 transition-colors hover:bg-white/6 hover:text-white/72"
                                onClick={() => onRemove(notification.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
                  <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-white/38">
                    <Inbox className="h-6 w-6" />
                  </span>
                  <div className="text-[14px] font-semibold text-white/76">No notifications yet</div>
                  <div className="mt-1 max-w-[15rem] text-[12px] leading-5 text-white/40">
                    Toasts and system updates will collect here so recent activity stays visible.
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function formatTimestamp(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
