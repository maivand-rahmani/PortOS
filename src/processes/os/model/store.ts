"use client";

import { create } from "zustand";

import { installedApps } from "@/apps";
import type { AppConfig, AppConfigMap, LoadedAppMap } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";

import {
  createAppRegistryModel,
  indexAppConfigs,
  loadAppModule,
  type AppRegistryState,
} from "./app-registry";
import {
  attachWindowToProcessModel,
  createProcessManagerModel,
  startProcessModel,
  stopProcessModel,
  type ProcessManagerState,
} from "./process-manager";
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

export type OSBootPhase = "booting" | "ready";

export type OSRuntimeSnapshot = {
  apps: AppConfig[];
  appMap: AppConfigMap;
  processes: ProcessInstance[];
  windows: WindowInstance[];
  activeWindowId: string | null;
  bootPhase: OSBootPhase;
  bootProgress: number;
};

export type OSStore = AppRegistryState &
  ProcessManagerState &
  WindowManagerState & {
    bootPhase: OSBootPhase;
    bootProgress: number;
    setBootProgress: (progress: number) => void;
    completeBoot: () => void;
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
    beginWindowResize: (
      windowId: string,
      direction: WindowResizeDirection,
      pointer: WindowPosition,
    ) => void;
    updateWindowResize: (pointer: WindowPosition, bounds: DesktopBounds) => void;
    endWindowResize: () => void;
    resizeWindowsToBounds: (bounds: DesktopBounds) => void;
    terminateProcess: (processId: string) => void;
  };

const defaultAppMap = indexAppConfigs(installedApps);

export const useOSStore = create<OSStore>()((set, get) => ({
  ...createAppRegistryModel({
    apps: installedApps,
    appMap: defaultAppMap,
  }),
  ...createProcessManagerModel(),
  ...createWindowManagerModel(),
  bootPhase: "booting",
  bootProgress: 0,
  setBootProgress: (progress) => {
    set({
      bootProgress: Math.max(0, Math.min(100, progress)),
    });
  },
  completeBoot: () => {
    set({
      bootPhase: "ready",
      bootProgress: 100,
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

    set({
      windows: nextWindowState.windows,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },
  endWindowDrag: () => {
    const state = get();
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
}));
