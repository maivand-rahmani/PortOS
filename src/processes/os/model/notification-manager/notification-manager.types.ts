/**
 * Notification type definitions for the OS notification system.
 *
 * Notifications are system-wide messages displayed as transient toasts
 * and collected in a persistent notification panel.
 */

export type NotificationLevel = "info" | "success" | "warning" | "error";

export type OSNotification = {
  /** Unique identifier. */
  id: string;
  /** Short title displayed in the toast header. */
  title: string;
  /** Optional longer body text. */
  body?: string;
  /** Severity level controls the icon and accent color. */
  level: NotificationLevel;
  /** ID of the app that sent this notification (optional). */
  appId?: string;
  /** ISO timestamp of when the notification was created. */
  createdAt: string;
  /** Whether the user has seen/read this notification. */
  isRead: boolean;
};

/**
 * Notification manager state stored in the Zustand slice.
 */
export type NotificationManagerState = {
  /** All notifications, newest first. */
  notifications: OSNotification[];
  /** IDs of toasts currently visible on screen (auto-dismiss queue). */
  activeToastIds: string[];
};
