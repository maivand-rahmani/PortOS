/**
 * Pure model functions for the notification manager.
 *
 * Each function follows the `(state, input) => nextState` pattern
 * used by the Zustand store composition.
 */

import type {
  NotificationLevel,
  NotificationManagerState,
  OSNotification,
} from "./notification-manager.types";

export { type NotificationManagerState } from "./notification-manager.types";
export {
  type OSNotification,
  type NotificationLevel,
} from "./notification-manager.types";

// ── Initial state ───────────────────────────────────────────────────────────

export const notificationManagerInitialState: NotificationManagerState = {
  notifications: [],
  activeToastIds: [],
};

// ── Constants ───────────────────────────────────────────────────────────────

/** Maximum number of notifications kept in history. */
const MAX_NOTIFICATIONS = 100;

/** Maximum toasts visible simultaneously. */
const MAX_VISIBLE_TOASTS = 4;

// ── Model functions ─────────────────────────────────────────────────────────

export type PushNotificationInput = {
  title: string;
  body?: string;
  level?: NotificationLevel;
  appId?: string;
};

/**
 * Add a new notification and show it as a toast.
 * Oldest notifications beyond MAX_NOTIFICATIONS are pruned.
 */
export function pushNotificationModel(
  state: NotificationManagerState,
  input: PushNotificationInput,
): NotificationManagerState {
  const id = crypto.randomUUID();
  const notification: OSNotification = {
    id,
    title: input.title,
    body: input.body,
    level: input.level ?? "info",
    appId: input.appId,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  const nextNotifications = [notification, ...state.notifications].slice(
    0,
    MAX_NOTIFICATIONS,
  );

  const nextToasts = [id, ...state.activeToastIds].slice(0, MAX_VISIBLE_TOASTS);

  return {
    notifications: nextNotifications,
    activeToastIds: nextToasts,
  };
}

/** Remove a toast from the visible queue (e.g. after auto-dismiss timer). */
export function dismissToastModel(
  state: NotificationManagerState,
  toastId: string,
): NotificationManagerState {
  return {
    ...state,
    activeToastIds: state.activeToastIds.filter((id) => id !== toastId),
  };
}

/** Remove a notification from history entirely. */
export function removeNotificationModel(
  state: NotificationManagerState,
  notificationId: string,
): NotificationManagerState {
  return {
    notifications: state.notifications.filter((n) => n.id !== notificationId),
    activeToastIds: state.activeToastIds.filter((id) => id !== notificationId),
  };
}

/** Mark a notification as read. */
export function markNotificationReadModel(
  state: NotificationManagerState,
  notificationId: string,
): NotificationManagerState {
  return {
    ...state,
    notifications: state.notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n,
    ),
  };
}

/** Mark all notifications as read. */
export function markAllReadModel(
  state: NotificationManagerState,
): NotificationManagerState {
  return {
    ...state,
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
  };
}

/** Clear all notifications. */
export function clearAllNotificationsModel(): NotificationManagerState {
  return {
    notifications: [],
    activeToastIds: [],
  };
}

/** Count unread notifications. */
export function getUnreadCount(state: NotificationManagerState): number {
  return state.notifications.filter((n) => !n.isRead).length;
}
