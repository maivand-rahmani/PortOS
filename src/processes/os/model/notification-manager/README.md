# notification-manager

OS-level notification system that manages toast display and notification history.

## Files

- `notification-manager.types.ts` — type definitions (`OSNotification`, `NotificationLevel`, `NotificationManagerState`)
- `index.ts` — pure model functions and barrel exports

## Model functions

| Function | Purpose |
|---|---|
| `pushNotificationModel` | Add a notification and show it as a toast |
| `dismissToastModel` | Remove a toast from the visible queue |
| `removeNotificationModel` | Delete a notification from history |
| `markNotificationReadModel` | Mark a single notification as read |
| `markAllReadModel` | Mark all notifications as read |
| `clearAllNotificationsModel` | Clear all notifications and toasts |
| `getUnreadCount` | Count unread notifications |

## Constants

- `MAX_NOTIFICATIONS = 100` — history cap
- `MAX_VISIBLE_TOASTS = 4` — simultaneous toast limit
