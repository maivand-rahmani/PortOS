import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import { installedApps } from "@/apps";
import {
  createAppRegistryModel,
  indexAppConfigs,
  loadAppModule,
} from "../../app-registry";
import {
  createProcessManagerModel,
  startProcessModel,
  attachWindowToProcessModel,
} from "../../process-manager";
import { openWindowModel } from "../../window-manager";
import {
  getWorkspaceById,
  isFullscreenWorkspace,
  workspaceManagerInitialState,
} from "../../workspace-manager";
import { DEFAULT_LAUNCH_BOUNDS } from "./helpers";

const defaultAppMap = indexAppConfigs(installedApps);

export type AppSlice = Pick<
  OSStore,
  | "apps"
  | "appMap"
  | "loadedApps"
  | "processes"
  | "loadAppComponent"
  | "launchApp"
  | "activateApp"
>;

export const createAppSlice: StateCreator<OSStore, [], [], AppSlice> = (set, get) => ({
  ...createAppRegistryModel({
    apps: installedApps,
    appMap: defaultAppMap,
  }),
  ...createProcessManagerModel(),

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
      ? currentState.windows.find((w) => w.id === currentState.activeWindowId)
          ?.fullscreenRestoreWorkspaceId ?? workspaceManagerInitialState.currentWorkspaceId
      : currentState.currentWorkspaceId;
    const processResult = startProcessModel(
      { processes: currentState.processes },
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
      .filter((w) => w.appId === appId)
      .sort((a, b) => b.zIndex - a.zIndex);
    const visibleWindow = appWindows.find((w) => !w.isMinimized);

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
});
