"use client";

import { create } from "zustand";

import { installedApps } from "@/apps";
import type { AppConfig, AppConfigMap, LoadedAppMap } from "@/entities/app";
import type { FileNode, FileSystemNode } from "@/entities/file-system";
import type { ProcessInstance } from "@/entities/process";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";

import * as idb from "@/shared/lib/idb-storage";
import { dispatchFileSystemChange } from "@/shared/lib/fs-events";
import { PERSISTED_FILE_PATHS } from "@/shared/lib/fs-paths";
import {
  DEFAULT_WALLPAPER_ID,
  type Wallpaper,
  getWallpaperById,
} from "@/shared/lib/wallpapers";
import {
  loadSettings,
  loadCustomWallpaper,
  loadWallpaperId,
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
  beginFileDragModel,
  endFileDragModel,
  fileDragManagerInitialState,
  setFileDropTargetModel,
  updateFileDragModel,
  type FileDragManagerState,
  type FileDropTarget,
} from "./file-drag-manager";
import {
  createFileSystemManagerModel,
  getNodePath,
  hydrateFileSystemModel,
  createFileModel,
  createDirectoryModel,
  normalizePath,
  deleteNodeModel,
  renameNodeModel,
  moveNodeModel,
  copyNodeModel,
  resolveNodeByPath,
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
  migratePersistedSession,
  restoreSessionModel,
  serializeSessionModel,
  sessionManagerInitialState,
  type PersistedSessionState,
  type SessionManagerState,
  loadPersistedSession,
} from "./session-manager";
import {
  createDesktopWorkspaceModel,
  createFullscreenWorkspaceModel,
  beginSplitViewResizeModel,
  cycleWorkspaceModel,
  endSplitViewResizeModel,
  enterSplitViewModel,
  getWorkspaceById,
  getWorkspaceSplitView,
  isFullscreenWorkspace,
  isSplitWorkspace,
  removeWorkspaceModel,
  setSplitViewRatioModel,
  switchWorkspaceModel,
  syncActiveWindowToWorkspace,
  updateWorkspaceSplitViewModel,
  workspaceManagerInitialState,
  type WorkspaceId,
  type WorkspaceManagerState,
} from "./workspace-manager";
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
  applySplitViewFramesModel,
  enterWindowFullscreenModel,
  endWindowDragModel,
  endWindowResizeModel,
  exitWindowFullscreenModel,
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

function collapseSplitWorkspaceForWindow(input: {
  state: OSStore;
  windowId: string;
  bounds: Pick<DesktopBounds, "width" | "height">;
}) {
  const workspace = getWorkspaceById(input.state.workspaces, input.state.currentWorkspaceId);
  const targetWindow = input.state.windows.find((window) => window.id === input.windowId);

  if (!workspace || !targetWindow || !workspace.splitView) {
    return null;
  }

  const splitView = workspace.splitView;
  const remainingWindowId =
    splitView.leftWindowId === input.windowId
      ? splitView.rightWindowId
      : splitView.rightWindowId === input.windowId
        ? splitView.leftWindowId
        : null;

  if (!remainingWindowId) {
    return null;
  }

  const nextWorkspaceState = updateWorkspaceSplitViewModel(input.state, {
    workspaceId: workspace.id,
    splitView: null,
  });
  const remainingWindow = input.state.windows.find((window) => window.id === remainingWindowId);

  if (!remainingWindow) {
    return {
      workspaces: nextWorkspaceState.workspaces,
      splitResizeState: nextWorkspaceState.splitResizeState,
      activeWindowId: input.state.activeWindowId,
      windows: input.state.windows,
    };
  }

  const nextWindows = input.state.windows.map((window) => {
    if (window.id !== remainingWindowId) {
      return window;
    }

    return {
      ...window,
      workspaceId: workspace.id,
      isFullscreen: true,
      position: { x: 0, y: 0 },
      size: {
        width: Math.max(320, input.bounds.width),
        height: Math.max(240, input.bounds.height),
      },
    };
  });

  return {
    workspaces: nextWorkspaceState.workspaces,
    splitResizeState: nextWorkspaceState.splitResizeState,
    activeWindowId: remainingWindowId,
    windows: nextWindows,
  };
}

function resolveFsNodeAtPath(state: OSStore, path: string): FileSystemNode | null {
  return resolveNodeByPath(
    normalizePath(path),
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );
}

function splitAbsolutePath(path: string) {
  const normalized = normalizePath(path);
  const parentPath = normalized.slice(0, normalized.lastIndexOf("/")) || "/";
  const name = normalized.slice(normalized.lastIndexOf("/") + 1);

  return {
    normalized,
    parentPath,
    name,
  };
}

async function ensureFsDirectoryAtPath(path: string): Promise<FileSystemNode | null> {
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return null;
  }

  const segments = normalized.split("/").filter(Boolean);
  let current: FileSystemNode | null = null;
  let currentPath = "";

  for (let index = 0; index < segments.length; index += 1) {
    currentPath = `${currentPath}/${segments[index]}`;

    const existing = resolveFsNodeAtPath(useOSStore.getState(), currentPath);

    if (existing) {
      if (existing.type !== "directory") {
        return null;
      }

      current = existing;
      continue;
    }

    if (!current || current.type !== "directory") {
      return null;
    }

    const created = await useOSStore.getState().fsCreateDirectory(current.id, segments[index]);

    if (!created || created.type !== "directory") {
      return null;
    }

    current = created;
  }

  return current;
}

async function writeFsFileAtPath(path: string, content: string): Promise<void> {
  const existing = resolveFsNodeAtPath(useOSStore.getState(), path);

  if (existing) {
    if (existing.type !== "file") {
      return;
    }

    await useOSStore.getState().fsWriteContent(existing.id, content);
    return;
  }

  const { parentPath, name } = splitAbsolutePath(path);
  const parent = await ensureFsDirectoryAtPath(parentPath);

  if (!parent || parent.type !== "directory") {
    return;
  }

  await useOSStore.getState().fsCreateFile(parent.id, name, content);
}

async function writeFsJsonAtPath(path: string, value: unknown): Promise<void> {
  await writeFsFileAtPath(path, JSON.stringify(value, null, 2));
}

export const useOSStore = create<OSStore>()((set, get) => ({
  ...createAppRegistryModel({
    apps: installedApps,
    appMap: defaultAppMap,
  }),
  ...createProcessManagerModel(),
  ...createWindowManagerModel(),
  ...createFileSystemManagerModel(),
  ...fileDragManagerInitialState,
  ...sessionManagerInitialState,
  ...workspaceManagerInitialState,
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

    void (async () => {
      const wallpaperId = getWallpaperById(await loadWallpaperId()).id;

      set({
        wallpaperId,
      });
    })();
  },
  setWallpaper: (wallpaperId) => {
    const normalizedWallpaperId = getWallpaperById(wallpaperId).id;

    set({
      wallpaperId: normalizedWallpaperId,
    });

    if (typeof window !== "undefined") {
      void writeFsJsonAtPath(PERSISTED_FILE_PATHS.settingsWallpaper, {
        wallpaperId: normalizedWallpaperId,
        customWallpaperDataUrl: get().customWallpaperDataUrl,
      });
    }
  },
  setCustomWallpaper: async (dataUrl) => {
    set({ wallpaperId: "custom", customWallpaperDataUrl: dataUrl });

    if (typeof window !== "undefined") {
      await writeFsJsonAtPath(PERSISTED_FILE_PATHS.settingsWallpaper, {
        wallpaperId: "custom",
        customWallpaperDataUrl: dataUrl,
      });
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
  hydrateSession: async (bounds) => {
    if (typeof window === "undefined") {
      return;
    }

    const rawSession = await loadPersistedSession();

    if (!rawSession || typeof rawSession !== "object") {
      set({ sessionHydrated: true });
      return;
    }

    const session = rawSession as PersistedSessionState;

    const migratedSession = migratePersistedSession(session);

    if (!migratedSession || !Array.isArray(migratedSession.windows)) {
      set({ sessionHydrated: true });
      return;
    }

    const restored = restoreSessionModel({
      session: migratedSession,
      bounds,
      appMap: get().appMap,
      windowState: {
        windows: [],
        activeWindowId: null,
        nextZIndex: 100,
        dragState: null,
        resizeState: null,
      },
      processState: {
        processes: [],
      },
    });

    for (const window of restored.windows.windows) {
      await get().loadAppComponent(window.appId);
    }

    set({
      windows: restored.windows.windows,
      activeWindowId: restored.windows.activeWindowId,
      nextZIndex: restored.windows.nextZIndex,
      dragState: restored.windows.dragState,
      resizeState: restored.windows.resizeState,
      processes: restored.processes.processes,
      currentWorkspaceId: migratedSession.currentWorkspaceId ?? get().currentWorkspaceId,
      workspaces: migratedSession.workspaces,
      sessionHydrated: true,
    });

    await get().persistSessionSnapshot(
      serializeSessionModel({
        workspaces: migratedSession.workspaces,
        windows: restored.windows.windows,
        activeWindowId: restored.windows.activeWindowId,
        currentWorkspaceId: migratedSession.currentWorkspaceId,
      }),
    );
  },
  persistSessionSnapshot: async (snapshot) => {
    if (typeof window === "undefined") {
      return;
    }

    await writeFsJsonAtPath(PERSISTED_FILE_PATHS.sessionSnapshot, snapshot);
  },
  updateSettings: async (patch) => {
    const current = get().osSettings;
    const next = { ...current, ...patch };

    applySettingsToDOM(next);
    set({ osSettings: next });

    await writeFsJsonAtPath(PERSISTED_FILE_PATHS.settingsPreferences, next);
  },
  switchWorkspace: (workspaceId) => {
    const state = get();
    const nextWorkspaceState = switchWorkspaceModel(state, workspaceId);
    const nextActiveWindow = syncActiveWindowToWorkspace({
      windows: state.windows,
      activeWindowId: state.activeWindowId,
      nextZIndex: state.nextZIndex,
      dragState: state.dragState,
      resizeState: state.resizeState,
      currentWorkspaceId: nextWorkspaceState.currentWorkspaceId,
    });

    set({
      currentWorkspaceId: nextWorkspaceState.currentWorkspaceId,
      activeWindowId: nextActiveWindow.activeWindowId,
    });
  },
  cycleWorkspace: (direction) => {
    const state = get();
    const nextWorkspaceState = cycleWorkspaceModel(state, direction);
    const nextActiveWindow = syncActiveWindowToWorkspace({
      windows: state.windows,
      activeWindowId: state.activeWindowId,
      nextZIndex: state.nextZIndex,
      dragState: state.dragState,
      resizeState: state.resizeState,
      currentWorkspaceId: nextWorkspaceState.currentWorkspaceId,
    });

    set({
      currentWorkspaceId: nextWorkspaceState.currentWorkspaceId,
      activeWindowId: nextActiveWindow.activeWindowId,
    });
  },
  createDesktop: () => {
    const state = get();
    const nextWorkspaceState = createDesktopWorkspaceModel(state, {
      afterWorkspaceId: state.currentWorkspaceId,
    });

    set({
      currentWorkspaceId: nextWorkspaceState.state.currentWorkspaceId,
      workspaces: nextWorkspaceState.state.workspaces,
    });
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
    const currentWorkspace = getWorkspaceById(
      currentState.workspaces,
      currentState.currentWorkspaceId,
    );
    const launchWorkspaceId = isFullscreenWorkspace(currentWorkspace)
      ? currentState.windows.find((window) => window.id === currentState.activeWindowId)
          ?.fullscreenRestoreWorkspaceId ?? workspaceManagerInitialState.currentWorkspaceId
      : currentState.currentWorkspaceId;
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
        workspaceId: launchWorkspaceId,
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
    const targetWindow = state.windows.find((window) => window.id === windowId);

    if (!targetWindow) {
      return;
    }

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
      currentWorkspaceId: targetWindow.workspaceId,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  minimizeWindow: (windowId) => {
    const state = get();
    const targetWindow = state.windows.find((window) => window.id === windowId);

    if (!targetWindow) {
      return;
    }

    if (targetWindow.isFullscreen) {
      const collapsedSplit = collapseSplitWorkspaceForWindow({
        state,
        windowId,
        bounds: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });

      if (collapsedSplit) {
        set({
          windows: collapsedSplit.windows,
          workspaces: collapsedSplit.workspaces,
          splitResizeState: collapsedSplit.splitResizeState,
          activeWindowId: collapsedSplit.activeWindowId,
        });
      } else {
        get().toggleWindowFullscreen(windowId, {
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    }

    const refreshedState = get();
    const nextWindowState = minimizeWindowModel(
      {
        windows: refreshedState.windows,
        activeWindowId: refreshedState.activeWindowId,
        nextZIndex: refreshedState.nextZIndex,
        dragState: refreshedState.dragState,
        resizeState: refreshedState.resizeState,
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
    const targetWindow = state.windows.find((window) => window.id === windowId);

    if (!targetWindow) {
      return;
    }

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

    const restoredWindow = nextWindowState.windows.find((window) => window.id === windowId);

    set({
      windows: nextWindowState.windows,
      currentWorkspaceId: restoredWindow?.workspaceId ?? targetWindow.workspaceId,
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
  toggleWindowFullscreen: (windowId, bounds) => {
    const state = get();
    const targetWindow = state.windows.find((window) => window.id === windowId);

    if (!targetWindow) {
      return;
    }

    if (targetWindow.isFullscreen) {
      const collapsedSplit = collapseSplitWorkspaceForWindow({
        state,
        windowId,
        bounds,
      });

      if (collapsedSplit) {
        const nextWindowState = exitWindowFullscreenModel(
          {
            windows: collapsedSplit.windows,
            activeWindowId: collapsedSplit.activeWindowId,
            nextZIndex: state.nextZIndex,
            dragState: state.dragState,
            resizeState: state.resizeState,
          },
          {
            windowId,
            bounds: {
              ...DEFAULT_LAUNCH_BOUNDS,
              width: bounds.width,
              height: bounds.height,
            },
          },
        );
        const restoredWindow = nextWindowState.windows.find((window) => window.id === windowId);

        set({
          windows: nextWindowState.windows,
          currentWorkspaceId:
            restoredWindow?.workspaceId ?? collapsedSplit.activeWindowId ?? state.currentWorkspaceId,
          workspaces: collapsedSplit.workspaces,
          splitResizeState: collapsedSplit.splitResizeState,
          activeWindowId: collapsedSplit.activeWindowId,
          nextZIndex: nextWindowState.nextZIndex,
          dragState: nextWindowState.dragState,
          resizeState: nextWindowState.resizeState,
        });

        return;
      }

      const nextWindowState = exitWindowFullscreenModel(
        {
          windows: state.windows,
          activeWindowId: state.activeWindowId,
          nextZIndex: state.nextZIndex,
          dragState: state.dragState,
          resizeState: state.resizeState,
        },
        {
          windowId,
          bounds: {
            ...DEFAULT_LAUNCH_BOUNDS,
            width: bounds.width,
            height: bounds.height,
          },
        },
      );
      const nextWorkspaceState = removeWorkspaceModel(state, targetWindow.workspaceId);
      const restoredWindow = nextWindowState.windows.find((window) => window.id === windowId);

      set({
        windows: nextWindowState.windows,
        currentWorkspaceId:
          restoredWindow?.workspaceId ?? nextWorkspaceState.currentWorkspaceId,
        workspaces: nextWorkspaceState.workspaces,
        activeWindowId: nextWindowState.activeWindowId,
        nextZIndex: nextWindowState.nextZIndex,
        dragState: nextWindowState.dragState,
        resizeState: nextWindowState.resizeState,
      });

      return;
    }

    const fullscreenWorkspace = createFullscreenWorkspaceModel(state, {
      ownerWindowId: windowId,
      label: targetWindow.title,
    });
    const nextWindowState = enterWindowFullscreenModel(
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
        restoreWorkspaceId: targetWindow.workspaceId,
        fullscreenWorkspaceId: fullscreenWorkspace.workspace.id,
      },
    );

    set({
      windows: nextWindowState.windows,
      currentWorkspaceId: fullscreenWorkspace.state.currentWorkspaceId,
      workspaces: fullscreenWorkspace.state.workspaces,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  enterSplitView: (anchorWindowId, companionWindowId, side, bounds) => {
    const state = get();
    const anchorWindow = state.windows.find((window) => window.id === anchorWindowId);
    const companionWindow = state.windows.find((window) => window.id === companionWindowId);

    if (!anchorWindow || !companionWindow || anchorWindowId === companionWindowId) {
      return;
    }

    let runtimeState = state;
    let fullscreenWorkspaceId = anchorWindow.workspaceId;

    if (!anchorWindow.isFullscreen) {
      get().toggleWindowFullscreen(anchorWindowId, bounds);
      runtimeState = get();
      fullscreenWorkspaceId =
        runtimeState.windows.find((window) => window.id === anchorWindowId)?.workspaceId ??
        anchorWindow.workspaceId;
    }

    const workspace = getWorkspaceById(runtimeState.workspaces, fullscreenWorkspaceId);

    if (!workspace || workspace.kind !== "fullscreen") {
      return;
    }

    const leftWindowId = side === "left" ? anchorWindowId : companionWindowId;
    const rightWindowId = side === "left" ? companionWindowId : anchorWindowId;
    const nextWorkspaceState = enterSplitViewModel(runtimeState, {
      workspaceId: fullscreenWorkspaceId,
      leftWindowId,
      rightWindowId,
      ratio: 0.5,
    });
    const companionSourceWindow = runtimeState.windows.find((window) => window.id === companionWindowId);
    const nextWindows = runtimeState.windows.map((window) => {
      if (window.id !== companionWindowId) {
        return window;
      }

      return {
        ...window,
        workspaceId: fullscreenWorkspaceId,
        isMinimized: false,
        isFullscreen: true,
        fullscreenRestoreWorkspaceId:
          window.fullscreenRestoreWorkspaceId ??
          companionSourceWindow?.workspaceId ??
          runtimeState.currentWorkspaceId,
        fullscreenRestoreMaximized:
          window.fullscreenRestoreWorkspaceId != null
            ? window.fullscreenRestoreMaximized
            : window.isMaximized,
        restoredFrame:
          window.fullscreenRestoreWorkspaceId != null
            ? window.restoredFrame
            : window.isMaximized
              ? window.restoredFrame
              : {
                  position: window.position,
                  size: window.size,
                },
        isMaximized: false,
      };
    });
    const nextWindowState = applySplitViewFramesModel(
      {
        windows: nextWindows,
        activeWindowId: runtimeState.activeWindowId,
        nextZIndex: runtimeState.nextZIndex,
        dragState: runtimeState.dragState,
        resizeState: runtimeState.resizeState,
      },
      {
        workspaceId: fullscreenWorkspaceId,
        splitView: {
          leftWindowId,
          rightWindowId,
          ratio: 0.5,
        },
        bounds,
      },
    );

    set({
      windows: nextWindowState.windows,
      currentWorkspaceId: fullscreenWorkspaceId,
      workspaces: nextWorkspaceState.workspaces,
      activeWindowId: anchorWindowId,
      nextZIndex: runtimeState.nextZIndex,
      dragState: null,
      resizeState: null,
      splitResizeState: nextWorkspaceState.splitResizeState,
    });
  },
  setSplitViewRatio: (workspaceId, ratio, bounds) => {
    const state = get();
    const splitView = getWorkspaceSplitView(state.workspaces, workspaceId);

    if (!splitView) {
      return;
    }

    const leftWindow = state.windows.find((window) => window.id === splitView.leftWindowId);
    const rightWindow = state.windows.find((window) => window.id === splitView.rightWindowId);

    if (!leftWindow || !rightWindow) {
      return;
    }

    const minLeftRatio = leftWindow.minSize.width / Math.max(320, bounds.width);
    const maxLeftRatio = 1 - rightWindow.minSize.width / Math.max(320, bounds.width);
    const clampedRatio = Math.min(Math.max(ratio, minLeftRatio), maxLeftRatio);
    const nextWorkspaceState = setSplitViewRatioModel(state, {
      workspaceId,
      ratio: clampedRatio,
    });
    const nextWindowState = applySplitViewFramesModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        dragState: state.dragState,
        resizeState: state.resizeState,
      },
      {
        workspaceId,
        splitView: {
          ...splitView,
          ratio: clampedRatio,
        },
        bounds,
      },
    );

    set({
      workspaces: nextWorkspaceState.workspaces,
      splitResizeState: nextWorkspaceState.splitResizeState,
      windows: nextWindowState.windows,
    });
  },
  beginSplitViewResize: (workspaceId, pointerX) => {
    const nextWorkspaceState = beginSplitViewResizeModel(get(), {
      workspaceId,
      originPointerX: pointerX,
    });

    set({ splitResizeState: nextWorkspaceState.splitResizeState });
  },
  updateSplitViewResize: (pointerX, bounds) => {
    const state = get();

    if (!state.splitResizeState) {
      return;
    }

    const splitView = getWorkspaceSplitView(state.workspaces, state.splitResizeState.workspaceId);

    if (!splitView) {
      return;
    }

    const deltaX = pointerX - state.splitResizeState.originPointerX;
    const nextRatio = state.splitResizeState.originRatio + deltaX / Math.max(320, bounds.width);

    get().setSplitViewRatio(state.splitResizeState.workspaceId, nextRatio, bounds);
  },
  endSplitViewResize: () => {
    const nextWorkspaceState = endSplitViewResizeModel(get());

    set({ splitResizeState: nextWorkspaceState.splitResizeState });
  },
  closeFullscreenSpace: (workspaceId) => {
    const state = get();
    const workspace = getWorkspaceById(state.workspaces, workspaceId);

    if (!workspace || workspace.kind !== "fullscreen") {
      return;
    }

    const bounds = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const desktopWorkspace = state.workspaces.find((w) => w.kind === "desktop") ?? null;
    let currentWindows = state.windows;
    let currentWorkspaces = state.workspaces;
    let currentSplitResizeState = state.splitResizeState;

    if (workspace.splitView) {
      const collapsedSplit = collapseSplitWorkspaceForWindow({
        state,
        windowId: workspace.splitView.leftWindowId,
        bounds,
      });

      if (collapsedSplit) {
        currentWindows = collapsedSplit.windows;
        currentWorkspaces = collapsedSplit.workspaces;
        currentSplitResizeState = collapsedSplit.splitResizeState;
      }
    }

    const windowsInSpace = currentWindows.filter(
      (w) => w.workspaceId === workspaceId && w.isFullscreen,
    );

    let finalWindows = currentWindows;
    for (const window of windowsInSpace) {
      const exitResult = exitWindowFullscreenModel(
        {
          windows: finalWindows,
          activeWindowId: state.activeWindowId,
          nextZIndex: state.nextZIndex,
          dragState: state.dragState,
          resizeState: state.resizeState,
        },
        {
          windowId: window.id,
          bounds: {
            ...DEFAULT_LAUNCH_BOUNDS,
            width: bounds.width,
            height: bounds.height,
          },
        },
      );
      finalWindows = exitResult.windows;
    }

    const nextWorkspaceState = removeWorkspaceModel(
      {
        currentWorkspaceId: state.currentWorkspaceId,
        workspaces: currentWorkspaces,
        splitResizeState: currentSplitResizeState,
      },
      workspaceId,
    );

    const shouldSwitch = state.currentWorkspaceId === workspaceId;
    const fallbackWorkspaceId = shouldSwitch
      ? desktopWorkspace?.id ?? nextWorkspaceState.workspaces[0]?.id ?? state.currentWorkspaceId
      : state.currentWorkspaceId;

    set({
      windows: finalWindows,
      workspaces: nextWorkspaceState.workspaces,
      currentWorkspaceId: fallbackWorkspaceId,
      splitResizeState: nextWorkspaceState.splitResizeState,
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
      {
        bounds,
        workspaces: state.workspaces,
      },
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

    const collapsedSplit = targetWindow.isFullscreen
      ? collapseSplitWorkspaceForWindow({
          state,
          windowId,
          bounds: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        })
      : null;
    const baseState = collapsedSplit
      ? {
          ...state,
          windows: collapsedSplit.windows,
          workspaces: collapsedSplit.workspaces,
          splitResizeState: collapsedSplit.splitResizeState,
          activeWindowId: collapsedSplit.activeWindowId,
        }
      : state;
    const nextWindowState = closeWindowModel(
      {
        windows: baseState.windows,
        activeWindowId: baseState.activeWindowId,
        nextZIndex: baseState.nextZIndex,
        dragState: baseState.dragState,
        resizeState: baseState.resizeState,
      },
      windowId,
    );
    const nextProcessState = stopProcessModel(
      {
        processes: baseState.processes,
      },
      targetWindow.processId,
    );
    const isSingleFullscreen = targetWindow.isFullscreen && !collapsedSplit;
    const nextWorkspaceState = isSingleFullscreen
      ? removeWorkspaceModel(baseState, targetWindow.workspaceId)
      : null;
    const fallbackWorkspaceId = targetWindow.isFullscreen
      ? targetWindow.fullscreenRestoreWorkspaceId ?? nextWorkspaceState?.currentWorkspaceId ?? baseState.currentWorkspaceId
      : baseState.currentWorkspaceId;

    set({
      windows: nextWindowState.state.windows,
      currentWorkspaceId: fallbackWorkspaceId,
      workspaces: nextWorkspaceState?.workspaces ?? baseState.workspaces,
      splitResizeState: nextWorkspaceState?.splitResizeState ?? baseState.splitResizeState,
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

    const processWindow = state.windows.find((window) => window.id === targetProcess.windowId);
    const collapsedSplit = processWindow?.isFullscreen
      ? collapseSplitWorkspaceForWindow({
          state,
          windowId: processWindow.id,
          bounds: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        })
      : null;
    const baseState = collapsedSplit
      ? {
          ...state,
          windows: collapsedSplit.windows,
          workspaces: collapsedSplit.workspaces,
          splitResizeState: collapsedSplit.splitResizeState,
          activeWindowId: collapsedSplit.activeWindowId,
        }
      : state;
    const nextProcessState = stopProcessModel(
      {
        processes: baseState.processes,
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
        windows: baseState.windows,
        activeWindowId: baseState.activeWindowId,
        nextZIndex: baseState.nextZIndex,
        dragState: baseState.dragState,
        resizeState: baseState.resizeState,
      },
      targetProcess.windowId,
    );

    set({
      processes: nextProcessState.processes,
      windows: nextWindowState.state.windows,
      workspaces: baseState.workspaces,
      splitResizeState: baseState.splitResizeState,
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

    dispatchFileSystemChange({
      type: "file-created",
      nodeId: result.node.id,
      nodeType: result.node.type,
      path: getNodePath(result.node.id, result.state.fsNodeMap),
    });

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

    dispatchFileSystemChange({
      type: "directory-created",
      nodeId: result.node.id,
      nodeType: result.node.type,
      path: getNodePath(result.node.id, result.state.fsNodeMap),
    });

    return result.node;
  },

  fsReadContent: async (nodeId) => {
    const content = await idb.getContent(nodeId);

    return content?.data ?? null;
  },

  fsWriteContent: async (nodeId, content) => {
    const previousNode = get().fsNodeMap[nodeId];
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

    if (previousNode?.type === "file") {
      dispatchFileSystemChange({
        type: "file-written",
        nodeId,
        nodeType: previousNode.type,
        path: getNodePath(nodeId, nextState.fsNodeMap),
      });
    }
  },

  fsDeleteNode: async (nodeId) => {
    const previousNode = get().fsNodeMap[nodeId];
    const previousPath = previousNode
      ? getNodePath(nodeId, get().fsNodeMap)
      : undefined;
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

    if (previousNode) {
      dispatchFileSystemChange({
        type: "node-deleted",
        nodeId,
        nodeType: previousNode.type,
        previousPath,
      });
    }
  },

  fsRenameNode: async (nodeId, newName) => {
    const previousNode = get().fsNodeMap[nodeId];
    const previousPath = previousNode
      ? getNodePath(nodeId, get().fsNodeMap)
      : undefined;
    const nextState = renameNodeModel(get(), nodeId, newName);

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
    });

    const updatedNode = nextState.fsNodeMap[nodeId];

    if (updatedNode) {
      await idb.putNode(updatedNode);

      dispatchFileSystemChange({
        type: "node-renamed",
        nodeId,
        nodeType: updatedNode.type,
        path: getNodePath(nodeId, nextState.fsNodeMap),
        previousPath,
      });
    }
  },

  fsMoveNode: async (nodeId, newParentId) => {
    const previousNode = get().fsNodeMap[nodeId];
    const previousPath = previousNode
      ? getNodePath(nodeId, get().fsNodeMap)
      : undefined;
    const nextState = moveNodeModel(get(), nodeId, newParentId);

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
    });

    const updatedNode = nextState.fsNodeMap[nodeId];

    if (updatedNode) {
      await idb.putNode(updatedNode);

      dispatchFileSystemChange({
        type: "node-moved",
        nodeId,
        nodeType: updatedNode.type,
        path: getNodePath(nodeId, nextState.fsNodeMap),
        previousPath,
      });
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

  beginFileDrag: (nodeId, pointer) => {
    const next = beginFileDragModel(get(), { nodeId, pointer });

    set({
      fileDragState: next.fileDragState,
      fileDropTarget: next.fileDropTarget,
    });
  },

  updateFileDrag: (pointer) => {
    const next = updateFileDragModel(get(), pointer);

    set({ fileDragState: next.fileDragState });
  },

  setFileDropTarget: (target) => {
    const next = setFileDropTargetModel(get(), target);

    set({ fileDropTarget: next.fileDropTarget });
  },

  endFileDrag: () => {
    const next = endFileDragModel();

    set({
      fileDragState: next.fileDragState,
      fileDropTarget: next.fileDropTarget,
    });
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
