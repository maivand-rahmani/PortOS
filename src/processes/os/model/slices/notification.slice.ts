import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import {
  clearAllNotificationsModel,
  dismissToastModel,
  markAllReadModel,
  markNotificationReadModel,
  notificationManagerInitialState,
  pushNotificationModel,
  removeNotificationModel,
} from "../notification-manager";

export type NotificationSlice = Pick<
  OSStore,
  | "notifications"
  | "activeToastIds"
  | "pushNotification"
  | "dismissToast"
  | "removeNotification"
  | "markNotificationRead"
  | "markAllNotificationsRead"
  | "clearAllNotifications"
>;

export const createNotificationSlice: StateCreator<OSStore, [], [], NotificationSlice> = (set, get) => ({
  ...notificationManagerInitialState,

  pushNotification: (input) => {
    const next = pushNotificationModel(get(), input);

    set({
      notifications: next.notifications,
      activeToastIds: next.activeToastIds,
    });
  },

  dismissToast: (notificationId) => {
    const next = dismissToastModel(get(), notificationId);

    set({ activeToastIds: next.activeToastIds });
  },

  removeNotification: (notificationId) => {
    const next = removeNotificationModel(get(), notificationId);

    set({
      notifications: next.notifications,
      activeToastIds: next.activeToastIds,
    });
  },

  markNotificationRead: (notificationId) => {
    const next = markNotificationReadModel(get(), notificationId);

    set({ notifications: next.notifications });
  },

  markAllNotificationsRead: () => {
    const next = markAllReadModel(get());

    set({ notifications: next.notifications });
  },

  clearAllNotifications: () => {
    const next = clearAllNotificationsModel();

    set({
      notifications: next.notifications,
      activeToastIds: next.activeToastIds,
    });
  },
});
