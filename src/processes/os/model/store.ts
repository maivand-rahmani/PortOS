"use client";

import { create } from "zustand";

import { installedApps } from "@/apps";
import type { AppConfig, AppConfigMap, LoadedAppMap } from "@/entities/app";
import type { FileNode, FileSystemNode } from "@/entities/file-system";
import type { ProcessInstance } from "@/entities/process";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";

import * as idb from "@/shared/lib/idb-storage";
import {
  DEFAULT_WALLPAPER_ID,
  getStoredWallpaperId,
  setStoredWallpaperId,
  type Wallpaper,
  getWallpaperById,
} from "@/shared/lib/wallpapers";
import {
  loadSettings,
  saveSettings,
  loadCustomWallpaper,
  saveCustomWallpaper,
} from "@/apps/settings/model/settings.idb";
import {
  DEFAULT_OS_SETTINGS,
  ACCENT_COLOR_MAP,
  DOCK_ICON_SIZE_MAP,
  type OSSettings,
  type AccentColor,
} from "@/apps/settings/model/settings.types";
import {
  createAppRegistryModel,
  indexAppConfigs,
  loadAppModule,
  type AppRegistryState,
} from "./app-registry";
import {
  createFileSystemManagerModel,
  hydrateFileSystemModel,
  createFileModel,
  createDirectoryModel,
  deleteNodeModel,
  renameNodeModel,
  moveNodeModel,
  copyNodeModel,
  updateFileMetadataModel,
  setCutModel,
  setCopyModel,
  clearClipboardModel,
  searchNodesModel,
  setSearchQueryModel,
  setSearchResultsModel,
  clearSearchModel,
  type FileSystemManagerState,
} from "./file-system";
import {
  attachWindowToProcessModel,
  createProcessManagerModel,
  startProcessModel,
  stopProcessModel,
  type ProcessManagerState,
} from "./process-manager";
import {
  clearAllNotificationsModel,
  dismissToastModel,
  markAllReadModel,
  markNotificationReadModel,
  notificationManagerInitialState,
  pushNotificationModel,
  removeNotificationModel,
  type NotificationManagerState,
  type NotificationLevel,
} from "./notification-manager";
import {
  shortcutManagerInitialState,
  registerShortcutModel,
  registerShortcutsModel,
  unregisterShortcutModel,
  type ShortcutManagerState,
} from "./shortcut-manager";
import type { Shortcut } from "./shortcut-manager/shortcut-manager.types";
import {
  beginWindowDragModel,
  beginWindowResizeModel,
  closeWindowModel,
  createWindowManagerModel,
  endWindowDragModel,
  endWindowResizeModel,
  focusWindowModel,
  minimizeWindowModel,
  openWindowModel,
  resizeWindowsToBoundsModel,
  restoreWindowModel,
  toggleWindowMaximizeModel,
  updateDraggedWindowModel,
  updateResizedWindowModel,
  type WindowResizeDirection,
  type WindowManagerState,
} from "./window-manager";
import {
  detectSnapZone,
  getSnapFrame,
  type WindowSnapZone,
} from "./window-manager/window-manager.snap";

const DEFAULT_LAUNCH_BOUNDS: DesktopBounds = {
  width: 1440,
  height: 900,
  insetTop: 42,
  insetRight: 24,
  insetBottom: 120,
  insetLeft: 24,
};

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
  processes: ProcessInstance[];
  windows: WindowInstance[];
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
    updateSettings: (patch: Partial<OSSettings>) => Promise<void>;
    launchApp: (appId: string, bounds?: DesktopBounds) => Promise<string | null>;
    activateApp: (appId: string, bounds?: DesktopBounds) => Promise<string | null>;
    loadAppComponent: (appId: string) => Promise<LoadedAppMap[string] | null>;
    closeWindow: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
    minimizeWindow: (windowId: string) => void;
    restoreWindow: (windowId: string) => void;
    toggleWindowMaximize: (windowId: string, bounds: DesktopBounds) => void;
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

const defaultAppMap = indexAppConfigs(installedApps);

// ── DOM Side-effects ──────────────────────────────────────────────────────────

function applySettingsToDOM(settings: OSSettings): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  // Color scheme
  const isDark =
    settings.colorScheme === "dark" ||
    (settings.colorScheme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }

  // Accent color
  const accent = ACCENT_COLOR_MAP[settings.accentColor as AccentColor];

  if (accent) {
    root.style.setProperty("--accent", accent.value);
  }

  // Dock icon size
  const dockSize = DOCK_ICON_SIZE_MAP[settings.dockIconSize];

  if (dockSize) {
    root.style.setProperty("--dock-icon-size", `${dockSize.px}px`);
  }

  // Reduced transparency
  if (settings.reduceTransparency) {
    root.setAttribute("data-reduced-transparency", "");
  } else {
    root.removeAttribute("data-reduced-transparency");
  }
}

export const useOSStore = create<OSStore>()((set, get) => ({
  ...createAppRegistryModel({
    apps: installedApps,
    appMap: defaultAppMap,
  }),
  ...createProcessManagerModel(),
  ...createWindowManagerModel(),
  ...createFileSystemManagerModel(),
  ...notificationManagerInitialState,
  ...shortcutManagerInitialState,
  bootPhase: "off",
  bootProgress: 0,
  bootMessages: [],
  wallpaperId: DEFAULT_WALLPAPER_ID,
  customWallpaperDataUrl: null,
  osSettings: DEFAULT_OS_SETTINGS,
  windowSnapZone: null,
  setBootPhase: (phase) => {
    set({ bootPhase: phase });
  },
  setBootProgress: (progress) => {
    set({
      bootProgress: Math.max(0, Math.min(100, progress)),
    });
  },
  addBootMessage: (message) => {
    set((state) => ({
      bootMessages: [...state.bootMessages, message],
    }));
  },
  completeBoot: () => {
    set({
      bootPhase: "ready",
      bootProgress: 100,
    });
  },
  hydrateWallpaper: () => {
    if (typeof window === "undefined") {
      return;
    }

    const wallpaperId = getWallpaperById(getStoredWallpaperId()).id;

    set({
      wallpaperId,
    });
  },
  setWallpaper: (wallpaperId) => {
    const normalizedWallpaperId = getWallpaperById(wallpaperId).id;

    set({
      wallpaperId: normalizedWallpaperId,
    });

    if (typeof window !== "undefined") {
      setStoredWallpaperId(normalizedWallpaperId);
    }
  },
  setCustomWallpaper: async (dataUrl) => {
    set({ wallpaperId: "custom", customWallpaperDataUrl: dataUrl });

    if (typeof window !== "undefined") {
      setStoredWallpaperId("custom");
      await saveCustomWallpaper(dataUrl);
    }
  },
  hydrateSettings: async () => {
    if (typeof window === "undefined") {
      return;
    }

    const [settings, customWallpaper] = await Promise.all([
      loadSettings(),
      loadCustomWallpaper(),
    ]);

    applySettingsToDOM(settings);

    set({
      osSettings: settings,
      customWallpaperDataUrl: customWallpaper,
    });
  },
  updateSettings: async (patch) => {
    const current = get().osSettings;
    const next = { ...current, ...patch };

    applySettingsToDOM(next);
    set({ osSettings: next });

    await saveSettings(next);
  },
  loadAppComponent: async (appId) => {
    const currentApp = get().appMap[appId];

    if (!currentApp) {
      return null;
    }

    const existingComponent = get().loadedApps[appId];

    if (existingComponent) {
      return existingComponent;
    }

    const loadedApp = await loadAppModule(currentApp);

    set((state) => ({
      loadedApps: {
        ...state.loadedApps,
        [appId]: loadedApp.component,
      },
    }));

    return loadedApp.component;
  },
  launchApp: async (appId, bounds) => {
    const app = get().appMap[appId];

    if (!app) {
      return null;
    }

    const component = await get().loadAppComponent(appId);

    if (!component) {
      return null;
    }

    const currentState = get();
    const processResult = startProcessModel(
      {
        processes: currentState.processes,
      },
      app,
    );
    const windowResult = openWindowModel(
      {
        windows: currentState.windows,
        activeWindowId: currentState.activeWindowId,
        nextZIndex: currentState.nextZIndex,
        dragState: currentState.dragState,
        resizeState: currentState.resizeState,
      },
      {
        app,
        processId: processResult.process.id,
        instanceIndex: currentState.windows.length,
        bounds,
      },
    );
    const linkedProcesses = attachWindowToProcessModel(processResult.state, {
      processId: processResult.process.id,
      windowId: windowResult.window.id,
    });

    set({
      processes: linkedProcesses.processes,
      windows: windowResult.state.windows,
      activeWindowId: windowResult.state.activeWindowId,
      nextZIndex: windowResult.state.nextZIndex,
      dragState: windowResult.state.dragState,
    });

    if (app.window.launchMaximized) {
      const maximizeBounds = bounds ?? DEFAULT_LAUNCH_BOUNDS;

      get().toggleWindowMaximize(windowResult.window.id, maximizeBounds);
    }

    return windowResult.window.id;
  },
  activateApp: async (appId, bounds) => {
    const state = get();
    const appWindows = [...state.windows]
      .filter((window) => window.appId === appId)
      .sort((left, right) => right.zIndex - left.zIndex);
    const visibleWindow = appWindows.find((window) => !window.isMinimized);

    if (visibleWindow) {
      get().focusWindow(visibleWindow.id);

      return visibleWindow.id;
    }

    const minimizedWindow = appWindows[0];

    if (minimizedWindow) {
      get().restoreWindow(minimizedWindow.id);
      get().focusWindow(minimizedWindow.id);

      return minimizedWindow.id;
    }

    return get().launchApp(appId, bounds);
  },
  focusWindow: (windowId) => {
    const state = get();
    const nextWindowState = focusWindowModel(
      {
        windows: state.windows,
      activeWindowId: state.activeWindowId,
      nextZIndex: state.nextZIndex,
      dragState: state.dragState,
      resizeState: state.resizeState,
    },
    windowId,
  );

    set({
      windows: nextWindowState.windows,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  minimizeWindow: (windowId) => {
    const state = get();
    const nextWindowState = minimizeWindowModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      windowId,
    );

    set({
      windows: nextWindowState.windows,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  restoreWindow: (windowId) => {
    const state = get();
    const nextWindowState = restoreWindowModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      windowId,
    );

    set({
      windows: nextWindowState.windows,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  toggleWindowMaximize: (windowId, bounds) => {
    const state = get();
    const nextWindowState = toggleWindowMaximizeModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      {
        windowId,
        bounds,
      },
    );

    set({
      windows: nextWindowState.windows,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  beginWindowDrag: (windowId, pointer) => {
    const state = get();
    const nextWindowState = beginWindowDragModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      {
        windowId,
        pointer,
      },
    );

    set({
      windows: nextWindowState.windows,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  updateWindowDrag: (pointer, bounds) => {
    const state = get();
    const nextWindowState = updateDraggedWindowModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      {
        pointer,
        bounds,
      },
    );

    // Detect snap zone while dragging
    const snapZone = state.dragState ? detectSnapZone(pointer, bounds) : null;

    set({
      windows: nextWindowState.windows,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
      windowSnapZone: snapZone,
    });
  },
  endWindowDrag: () => {
    const state = get();
    const { dragState, windowSnapZone } = state;

    const nextWindowState = endWindowDragModel({
      windows: state.windows,
      activeWindowId: state.activeWindowId,
      nextZIndex: state.nextZIndex,
      dragState: state.dragState,
      resizeState: state.resizeState,
    });

    set({
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
      windowSnapZone: null,
    });

    // Snap frame is applied by the desktop shell which has access to bounds.
    // The shell reads windowSnapZone before this action clears it.
    // See use-desktop-shell.ts handlePointerUp.
    void dragState;
    void windowSnapZone;
  },
  snapWindowToZone: (windowId, zone, bounds) => {
    const state = get();
    const targetWindow = state.windows.find((w) => w.id === windowId);

    if (!targetWindow) return;

    const frame = getSnapFrame(zone, bounds);

    set({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? {
              ...w,
              position: frame.position,
              size: frame.size,
              isMaximized: zone === "top",
              restoredFrame:
                zone === "top" && !w.restoredFrame
                  ? { position: w.position, size: w.size }
                  : w.restoredFrame,
            }
          : w,
      ),
    });
  },
  beginWindowResize: (windowId, direction, pointer) => {
    const state = get();
    const nextWindowState = beginWindowResizeModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      {
        windowId,
        direction,
        pointer,
      },
    );

    set({
      windows: nextWindowState.windows,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  updateWindowResize: (pointer, bounds) => {
    const state = get();
    const nextWindowState = updateResizedWindowModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      {
        pointer,
        bounds,
      },
    );

    set({
      windows: nextWindowState.windows,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  endWindowResize: () => {
    const state = get();
    const nextWindowState = endWindowResizeModel({
      windows: state.windows,
      activeWindowId: state.activeWindowId,
      nextZIndex: state.nextZIndex,
      dragState: state.dragState,
      resizeState: state.resizeState,
    });

    set({
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  resizeWindowsToBounds: (bounds) => {
    const state = get();
    const nextWindowState = resizeWindowsToBoundsModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      bounds,
    );

    set({
      windows: nextWindowState.windows,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  closeWindow: (windowId) => {
    const state = get();
    const targetWindow = state.windows.find((window) => window.id === windowId);

    if (!targetWindow) {
      return;
    }

    const nextWindowState = closeWindowModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      windowId,
    );
    const nextProcessState = stopProcessModel(
      {
        processes: state.processes,
      },
      targetWindow.processId,
    );

    set({
      windows: nextWindowState.state.windows,
      activeWindowId: nextWindowState.state.activeWindowId,
      nextZIndex: nextWindowState.state.nextZIndex,
      dragState: nextWindowState.state.dragState,
      resizeState: nextWindowState.state.resizeState,
      processes: nextProcessState.processes,
    });
  },
  terminateProcess: (processId) => {
    const state = get();
    const targetProcess = state.processes.find((process) => process.id === processId);

    if (!targetProcess) {
      return;
    }

    const nextProcessState = stopProcessModel(
      {
        processes: state.processes,
      },
      processId,
    );

    if (!targetProcess.windowId) {
      set({
        processes: nextProcessState.processes,
      });

      return;
    }

    const nextWindowState = closeWindowModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      targetProcess.windowId,
    );

    set({
      processes: nextProcessState.processes,
      windows: nextWindowState.state.windows,
      activeWindowId: nextWindowState.state.activeWindowId,
      nextZIndex: nextWindowState.state.nextZIndex,
      dragState: nextWindowState.state.dragState,
      resizeState: nextWindowState.state.resizeState,
    });
  },

  // ── File System Actions ─────────────────────────────

  hydrateFileSystem: async () => {
    if (typeof window === "undefined") {
      return;
    }

    const nodes = await idb.seedDefaultFileSystem();
    const nextState = hydrateFileSystemModel(get(), nodes);

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
      fsHydrated: nextState.fsHydrated,
    });
  },

  fsCreateFile: async (parentId, name, content) => {
    const result = createFileModel(get(), { parentId, name, content });

    set({
      fsNodes: result.state.fsNodes,
      fsNodeMap: result.state.fsNodeMap,
      fsChildMap: result.state.fsChildMap,
    });

    await idb.putNode(result.node);

    if (content) {
      await idb.putContent({
        nodeId: result.node.id,
        data: content,
        encoding: "utf-8",
        checksum: idb.computeChecksum(content),
      });
    }

    return result.node;
  },

  fsCreateDirectory: async (parentId, name) => {
    const result = createDirectoryModel(get(), { parentId, name });

    set({
      fsNodes: result.state.fsNodes,
      fsNodeMap: result.state.fsNodeMap,
      fsChildMap: result.state.fsChildMap,
    });

    await idb.putNode(result.node);

    return result.node;
  },

  fsReadContent: async (nodeId) => {
    const content = await idb.getContent(nodeId);

    return content?.data ?? null;
  },

  fsWriteContent: async (nodeId, content) => {
    const size = new Blob([content]).size;
    const nextState = updateFileMetadataModel(get(), nodeId, { size });

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
    });

    const updatedNode = nextState.fsNodeMap[nodeId];

    if (updatedNode) {
      await idb.putNode(updatedNode);
    }

    await idb.putContent({
      nodeId,
      data: content,
      encoding: "utf-8",
      checksum: idb.computeChecksum(content),
    });
  },

  fsDeleteNode: async (nodeId) => {
    const result = deleteNodeModel(get(), nodeId);

    set({
      fsNodes: result.state.fsNodes,
      fsNodeMap: result.state.fsNodeMap,
      fsChildMap: result.state.fsChildMap,
      fsActiveFileId: result.state.fsActiveFileId,
      fsClipboard: result.state.fsClipboard,
    });

    await idb.deleteNodes(result.deletedIds);
    await idb.deleteContents(result.deletedIds);
  },

  fsRenameNode: async (nodeId, newName) => {
    const nextState = renameNodeModel(get(), nodeId, newName);

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
    });

    const updatedNode = nextState.fsNodeMap[nodeId];

    if (updatedNode) {
      await idb.putNode(updatedNode);
    }
  },

  fsMoveNode: async (nodeId, newParentId) => {
    const nextState = moveNodeModel(get(), nodeId, newParentId);

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
    });

    const updatedNode = nextState.fsNodeMap[nodeId];

    if (updatedNode) {
      await idb.putNode(updatedNode);
    }
  },

  fsCopyNode: async (nodeId, newParentId) => {
    const result = copyNodeModel(get(), nodeId, newParentId);

    if (!result.newNode) {
      return null;
    }

    set({
      fsNodes: result.state.fsNodes,
      fsNodeMap: result.state.fsNodeMap,
      fsChildMap: result.state.fsChildMap,
    });

    await idb.putNode(result.newNode);

    // Copy content if it is a file
    if (result.newNode.type === "file") {
      const sourceContent = await idb.getContent(nodeId);

      if (sourceContent) {
        await idb.putContent({
          nodeId: result.newNode.id,
          data: sourceContent.data,
          encoding: sourceContent.encoding,
          checksum: sourceContent.checksum,
        });
      }
    }

    return result.newNode;
  },

  fsSearch: (query) => {
    const nextState = setSearchQueryModel(get(), query);
    const results = searchNodesModel(nextState, query);
    const withResults = setSearchResultsModel(nextState, results);

    set({
      fsSearchQuery: withResults.fsSearchQuery,
      fsSearchResults: withResults.fsSearchResults,
    });
  },

  fsClearSearch: () => {
    const nextState = clearSearchModel(get());

    set({
      fsSearchQuery: nextState.fsSearchQuery,
      fsSearchResults: nextState.fsSearchResults,
    });
  },

  fsCut: (nodeIds) => {
    const nextState = setCutModel(get(), nodeIds);

    set({ fsClipboard: nextState.fsClipboard });
  },

  fsCopy: (nodeIds) => {
    const nextState = setCopyModel(get(), nodeIds);

    set({ fsClipboard: nextState.fsClipboard });
  },

  fsPaste: async (targetParentId) => {
    const clipboard = get().fsClipboard;

    if (!clipboard || clipboard.nodeIds.length === 0) {
      return;
    }

    if (clipboard.operation === "copy") {
      for (const nodeId of clipboard.nodeIds) {
        await get().fsCopyNode(nodeId, targetParentId);
      }
    } else {
      for (const nodeId of clipboard.nodeIds) {
        await get().fsMoveNode(nodeId, targetParentId);
      }

      set({ fsClipboard: null });
    }
  },

  fsClearClipboard: () => {
    const nextState = clearClipboardModel(get());

    set({ fsClipboard: nextState.fsClipboard });
  },

  fsSetActiveFile: (nodeId) => {
    set({ fsActiveFileId: nodeId });
  },

  // ── Notification Actions ───────────────────────────

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

  // ── Shortcut Actions ───────────────────────────────

  registerShortcut: (shortcut) => {
    const next = registerShortcutModel(get(), shortcut);

    set({ shortcuts: next.shortcuts });
  },

  registerShortcuts: (shortcuts) => {
    const next = registerShortcutsModel(get(), shortcuts);

    set({ shortcuts: next.shortcuts });
  },

  unregisterShortcut: (shortcutId) => {
    const next = unregisterShortcutModel(get(), shortcutId);

    set({ shortcuts: next.shortcuts });
  },
}));
