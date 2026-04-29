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
  buildProcessRecord,
} from "../../process-manager";
import { openWindowModel } from "../../window-manager";
import { buildWindowRecord } from "../../window-manager/window-manager.helpers";
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
  | "processRecord"
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

    let resultWindowId: string | null = null;

    set((state) => {
      const currentWorkspace = getWorkspaceById(
        state.workspaces,
        state.currentWorkspaceId,
      );
      const activeWin = state.activeWindowId ? state.windowRecord[state.activeWindowId] : undefined;
      const launchWorkspaceId = isFullscreenWorkspace(currentWorkspace)
        ? activeWin?.fullscreenRestoreWorkspaceId ?? workspaceManagerInitialState.currentWorkspaceId
        : state.currentWorkspaceId;
      const processResult = startProcessModel(
        { processes: state.processes, processRecord: state.processRecord },
        app,
      );
      const windowResult = openWindowModel(
        {
          windows: state.windows,
          windowRecord: state.windowRecord,
          activeWindowId: state.activeWindowId,
          nextZIndex: state.nextZIndex,
          dragState: state.dragState,
          resizeState: state.resizeState,
        },
        {
          app,
          processId: processResult.process.id,
          instanceIndex: state.windows.length,
          bounds,
          workspaceId: launchWorkspaceId,
        },
      );
      const linkedProcesses = attachWindowToProcessModel(processResult.state, {
        processId: processResult.process.id,
        windowId: windowResult.window.id,
      });

      resultWindowId = windowResult.window.id;

      return {
        processes: linkedProcesses.processes,
        processRecord: buildProcessRecord(linkedProcesses.processes),
        windows: windowResult.state.windows,
        windowRecord: buildWindowRecord(windowResult.state.windows),
        activeWindowId: windowResult.state.activeWindowId,
        nextZIndex: windowResult.state.nextZIndex,
        dragState: windowResult.state.dragState,
      };
    });

    if (app.window.launchMaximized && resultWindowId) {
      const maximizeBounds = bounds ?? DEFAULT_LAUNCH_BOUNDS;

      get().toggleWindowMaximize(resultWindowId, maximizeBounds);
    }

    return resultWindowId;
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
