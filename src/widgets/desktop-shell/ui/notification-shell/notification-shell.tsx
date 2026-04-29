"use client";

import type { AppConfigMap } from "@/entities/app";
import type { OSNotification } from "@/processes";
import { NotificationCenterPanel } from "../notification-center-panel/notification-center-panel";
import { NotificationToasts } from "../notification-toasts/notification-toasts";

type NotificationShellProps = {
  isBooting: boolean;
  activeToasts: OSNotification[];
  notifications: OSNotification[];
  unreadNotificationCount: number;
  appMap: AppConfigMap;
  isNotificationCenterOpen: boolean;
  onDismissToast: (id: string) => void;
  onOpenCenter: () => void;
  onCloseCenter: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
};

export function NotificationShell({
  isBooting: _isBooting,
  activeToasts,
  notifications,
  unreadNotificationCount,
  appMap,
  isNotificationCenterOpen,
  onDismissToast,
  onOpenCenter,
  onCloseCenter,
  onMarkRead,
  onMarkAllRead,
  onRemove,
  onClearAll,
}: NotificationShellProps) {
  return (
    <>
      <NotificationToasts
        toasts={activeToasts}
        appMap={appMap}
        onDismiss={onDismissToast}
        onOpenCenter={onOpenCenter}
      />

      <NotificationCenterPanel
        isOpen={isNotificationCenterOpen}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        appMap={appMap}
        onClose={onCloseCenter}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
        onRemove={onRemove}
        onClearAll={onClearAll}
      />
    </>
  );
}
