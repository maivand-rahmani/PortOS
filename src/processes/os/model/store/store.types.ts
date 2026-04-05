import type { AppConfig, AppConfigMap, LoadedAppMap } from "@/entities/app";
import type { DesktopBounds } from "@/entities/window";
import type { Wallpaper } from "@/shared/lib/app-data/wallpapers";
import type { OSSettings } from "@/apps/settings/model/settings.types";
import type { AppRegistryState } from "../app-registry";
import type { ProcessManagerState } from "../process-manager";
import type { WindowManagerState } from "../window-manager";
import type { WindowSnapZone } from "../window-manager/window-manager.snap";
import type { FileSystemManagerState } from "../file-system";
import type { FileDragManagerState, FileDropTarget } from "../file-drag-manager";
import type { SessionManagerState, PersistedSessionState } from "../session-manager";
import type { WorkspaceManagerState, WorkspaceId } from "../workspace-manager";
import type { NotificationManagerState, NotificationLevel } from "../notification-manager";
import type { ShortcutManagerState } from "../shortcut-manager";
import type { Shortcut } from "../shortcut-manager/shortcut-manager.types";
import type { FileNode, FileSystemNode } from "@/entities/file-system";
import type { WindowPosition } from "@/entities/window";
import type { WindowResizeDirection } from "../window-manager";

export type OSBootPhase =
  | "off"
  | "power-on"
  | "logo"
  | "init"
  | "reveal"
  | "ready";

export type OSRuntimeSnapshot = {
  apps: AppConfig[];
  appMap: AppConfigMap;
  processes: import("@/entities/process").ProcessInstance[];
  windows: import("@/entities/window").WindowInstance[];
  activeWindowId: string | null;
  wallpaperId: Wallpaper["id"];
  bootPhase: OSBootPhase;
  bootProgress: number;
  bootMessages: string[];
};

export type OSStore = AppRegistryState &
  ProcessManagerState &
  WindowManagerState &
  FileSystemManagerState &
  FileDragManagerState &
  SessionManagerState &
  WorkspaceManagerState &
  NotificationManagerState &
  ShortcutManagerState & {
    bootPhase: OSBootPhase;
    bootProgress: number;
    bootMessages: string[];
    wallpaperId: Wallpaper["id"];
    customWallpaperDataUrl: string | null;
    osSettings: OSSettings;
    windowSnapZone: WindowSnapZone | null;
    setBootPhase: (phase: OSBootPhase) => void;
    setBootProgress: (progress: number) => void;
    addBootMessage: (message: string) => void;
    completeBoot: () => void;
    hydrateWallpaper: () => void;
    setWallpaper: (wallpaperId: Wallpaper["id"]) => void;
    setCustomWallpaper: (dataUrl: string) => Promise<void>;
    hydrateSettings: () => Promise<void>;
    hydrateSession: (bounds: DesktopBounds) => Promise<void>;
    persistSessionSnapshot: (snapshot: PersistedSessionState) => Promise<void>;
    updateSettings: (patch: Partial<OSSettings>) => Promise<void>;
    switchWorkspace: (workspaceId: WorkspaceId) => void;
    cycleWorkspace: (direction: 1 | -1) => void;
    createDesktop: () => void;
    launchApp: (appId: string, bounds?: DesktopBounds) => Promise<string | null>;
    activateApp: (appId: string, bounds?: DesktopBounds) => Promise<string | null>;
    loadAppComponent: (appId: string) => Promise<LoadedAppMap[string] | null>;
    closeWindow: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
    minimizeWindow: (windowId: string) => void;
    restoreWindow: (windowId: string) => void;
    toggleWindowMaximize: (windowId: string, bounds: DesktopBounds) => void;
    toggleWindowFullscreen: (
      windowId: string,
      bounds: Pick<DesktopBounds, "width" | "height">,
    ) => void;
    enterSplitView: (
      anchorWindowId: string,
      companionWindowId: string,
      side: "left" | "right",
      bounds: Pick<DesktopBounds, "width" | "height">,
    ) => void;
    setSplitViewRatio: (
      workspaceId: WorkspaceId,
      ratio: number,
      bounds: Pick<DesktopBounds, "width" | "height">,
    ) => void;
    beginSplitViewResize: (workspaceId: WorkspaceId, pointerX: number) => void;
    updateSplitViewResize: (pointerX: number, bounds: Pick<DesktopBounds, "width" | "height">) => void;
    endSplitViewResize: () => void;
    beginWindowDrag: (windowId: string, pointer: WindowPosition) => void;
    updateWindowDrag: (pointer: WindowPosition, bounds: DesktopBounds) => void;
    endWindowDrag: () => void;
    snapWindowToZone: (windowId: string, zone: WindowSnapZone, bounds: DesktopBounds) => void;
    beginWindowResize: (
      windowId: string,
      direction: WindowResizeDirection,
      pointer: WindowPosition,
    ) => void;
    updateWindowResize: (pointer: WindowPosition, bounds: DesktopBounds) => void;
    endWindowResize: () => void;
    resizeWindowsToBounds: (bounds: DesktopBounds) => void;
    closeFullscreenSpace: (workspaceId: WorkspaceId) => void;
    terminateProcess: (processId: string) => void;
    // File system
    hydrateFileSystem: () => Promise<void>;
    fsCreateFile: (
      parentId: string,
      name: string,
      content?: string,
    ) => Promise<FileNode | null>;
    fsCreateDirectory: (
      parentId: string,
      name: string,
    ) => Promise<FileSystemNode | null>;
    fsReadContent: (nodeId: string) => Promise<string | null>;
    fsWriteContent: (nodeId: string, content: string) => Promise<void>;
    fsDeleteNode: (nodeId: string) => Promise<void>;
    fsRenameNode: (nodeId: string, newName: string) => Promise<void>;
    fsMoveNode: (nodeId: string, newParentId: string) => Promise<void>;
    fsCopyNode: (
      nodeId: string,
      newParentId: string,
    ) => Promise<FileSystemNode | null>;
    fsSearch: (query: string) => void;
    fsClearSearch: () => void;
    fsCut: (nodeIds: string[]) => void;
    fsCopy: (nodeIds: string[]) => void;
    fsPaste: (targetParentId: string) => Promise<void>;
    fsClearClipboard: () => void;
    fsSetActiveFile: (nodeId: string | null) => void;
    beginFileDrag: (nodeId: string, pointer: WindowPosition) => void;
    updateFileDrag: (pointer: WindowPosition) => void;
    setFileDropTarget: (target: FileDropTarget | null) => void;
    endFileDrag: () => void;
    // Notifications
    pushNotification: (input: {
      title: string;
      body?: string;
      level?: NotificationLevel;
      appId?: string;
    }) => void;
    dismissToast: (notificationId: string) => void;
    removeNotification: (notificationId: string) => void;
    markNotificationRead: (notificationId: string) => void;
    markAllNotificationsRead: () => void;
    clearAllNotifications: () => void;
    // Shortcuts
    registerShortcut: (shortcut: Shortcut) => void;
    registerShortcuts: (shortcuts: Shortcut[]) => void;
    unregisterShortcut: (shortcutId: string) => void;
  };
