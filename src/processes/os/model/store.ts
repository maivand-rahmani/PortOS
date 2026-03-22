"use client";

import { create } from "zustand";

import { installedApps } from "@/apps";
import type { AppConfig, AppConfigMap, LoadedAppMap } from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";
import type { WindowInstance } from "@/entities/window";

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
  closeWindowModel,
  createWindowManagerModel,
  focusWindowModel,
  openWindowModel,
  type WindowManagerState,
} from "./window-manager";

export type OSRuntimeSnapshot = {
  apps: AppConfig[];
  appMap: AppConfigMap;
  processes: ProcessInstance[];
  windows: WindowInstance[];
  activeWindowId: string | null;
};

export type OSStore = AppRegistryState &
  ProcessManagerState &
  WindowManagerState & {
    launchApp: (appId: string) => Promise<string | null>;
    loadAppComponent: (appId: string) => Promise<LoadedAppMap[string] | null>;
    closeWindow: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
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
  launchApp: async (appId) => {
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
      },
      {
        app,
        processId: processResult.process.id,
        instanceIndex: currentState.windows.length,
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
    });

    return windowResult.window.id;
  },
  focusWindow: (windowId) => {
    const state = get();
    const nextWindowState = focusWindowModel(
      {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
      },
      windowId,
    );

    set({
      windows: nextWindowState.windows,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
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
      },
      targetProcess.windowId,
    );

    set({
      processes: nextProcessState.processes,
      windows: nextWindowState.state.windows,
      activeWindowId: nextWindowState.state.activeWindowId,
      nextZIndex: nextWindowState.state.nextZIndex,
    });
  },
}));
