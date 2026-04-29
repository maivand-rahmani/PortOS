import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import {
  beginWindowDragModel,
  beginWindowResizeModel,
  closeWindowModel,
  createWindowManagerModel,
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
} from "../../window-manager";
import { buildWindowRecord } from "../../window-manager/window-manager.helpers";
import {
  detectSnapZone,
  getSnapFrame,
} from "../../window-manager/window-manager.snap";
import {
  removeWorkspaceModel,
  createFullscreenWorkspaceModel,
} from "../../workspace-manager";
import { stopProcessModel, buildProcessRecord } from "../../process-manager";
import { collapseSplitWorkspaceForWindow, DEFAULT_LAUNCH_BOUNDS } from "./helpers";

export type WindowSlice = Pick<
  OSStore,
  | "windows"
  | "windowRecord"
  | "activeWindowId"
  | "nextZIndex"
  | "dragState"
  | "resizeState"
  | "windowSnapZone"
  | "dirtyWindows"
  | "hasDirtyWindows"
  | "focusWindow"
  | "minimizeWindow"
  | "restoreWindow"
  | "toggleWindowMaximize"
  | "toggleWindowFullscreen"
  | "beginWindowDrag"
  | "updateWindowDrag"
  | "endWindowDrag"
  | "snapWindowToZone"
  | "beginWindowResize"
  | "updateWindowResize"
  | "endWindowResize"
  | "resizeWindowsToBounds"
  | "closeWindow"
  | "terminateProcess"
  | "markWindowDirty"
  | "clearWindowDirty"
>;

export const createWindowSlice: StateCreator<OSStore, [], [], WindowSlice> = (set, get) => ({
  ...createWindowManagerModel(),
  windowSnapZone: null,
  dirtyWindows: new Set<string>(),
  hasDirtyWindows: false,
  markWindowDirty: (windowId: string) => {
    const state = get();
    if (state.dirtyWindows.has(windowId)) {
      return;
    }
    const nextDirtyWindows = new Set(state.dirtyWindows);
    nextDirtyWindows.add(windowId);
    set({ dirtyWindows: nextDirtyWindows, hasDirtyWindows: nextDirtyWindows.size > 0 });
  },
  clearWindowDirty: (windowId: string) => {
    const state = get();
    if (!state.dirtyWindows.has(windowId)) {
      return;
    }
    const nextDirtyWindows = new Set(state.dirtyWindows);
    nextDirtyWindows.delete(windowId);
    set({ dirtyWindows: nextDirtyWindows, hasDirtyWindows: nextDirtyWindows.size > 0 });
  },

  focusWindow: (windowId) => {
    const state = get();
    const targetWindow = state.windowRecord[windowId];

    if (!targetWindow) {
      return;
    }

    const nextWindowState = focusWindowModel(state, windowId);

    set({
      ...nextWindowState,
      currentWorkspaceId: targetWindow.workspaceId,
    });
  },

  minimizeWindow: (windowId) => {
    const state = get();
    const targetWindow = state.windowRecord[windowId];

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
          windowRecord: buildWindowRecord(collapsedSplit.windows),
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
    const nextWindowState = minimizeWindowModel(refreshedState, windowId);

    set({
      ...nextWindowState,
    });
  },

  restoreWindow: (windowId) => {
    const state = get();
    const targetWindow = state.windowRecord[windowId];

    if (!targetWindow) {
      return;
    }

    const nextWindowState = restoreWindowModel(state, windowId);
    const restoredWindow = nextWindowState.windowRecord[windowId];

    set({
      ...nextWindowState,
      currentWorkspaceId: restoredWindow?.workspaceId ?? targetWindow.workspaceId,
    });
  },

  toggleWindowMaximize: (windowId, bounds) => {
    const state = get();
    const nextWindowState = toggleWindowMaximizeModel(state, { windowId, bounds });

    set({
      ...nextWindowState,
    });
  },

  toggleWindowFullscreen: (windowId, bounds) => {
    const state = get();
    const targetWindow = state.windowRecord[windowId];

    if (!targetWindow) {
      return;
    }

    if (targetWindow.isFullscreen) {
      const collapsedSplit = collapseSplitWorkspaceForWindow({ state, windowId, bounds });

      if (collapsedSplit) {
        const nextWindowState = exitWindowFullscreenModel(
          {
            windows: collapsedSplit.windows,
            windowRecord: buildWindowRecord(collapsedSplit.windows),
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
        const restoredWindow = nextWindowState.windowRecord[windowId];

        set({
          windows: nextWindowState.windows,
          windowRecord: nextWindowState.windowRecord,
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

      const nextWindowState = exitWindowFullscreenModel(state, {
        windowId,
        bounds: {
          ...DEFAULT_LAUNCH_BOUNDS,
          width: bounds.width,
          height: bounds.height,
        },
      });
      const nextWorkspaceState = removeWorkspaceModel(state, targetWindow.workspaceId);
      const restoredWindow = nextWindowState.windowRecord[windowId];

      set({
        windows: nextWindowState.windows,
        windowRecord: nextWindowState.windowRecord,
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
    const nextWindowState = enterWindowFullscreenModel(state, {
      windowId,
      bounds,
      restoreWorkspaceId: targetWindow.workspaceId,
      fullscreenWorkspaceId: fullscreenWorkspace.workspace.id,
    });

    set({
      windows: nextWindowState.windows,
      windowRecord: nextWindowState.windowRecord,
      currentWorkspaceId: fullscreenWorkspace.state.currentWorkspaceId,
      workspaces: fullscreenWorkspace.state.workspaces,
      activeWindowId: nextWindowState.activeWindowId,
      nextZIndex: nextWindowState.nextZIndex,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },

  beginWindowDrag: (windowId, pointer) => {
    const state = get();
    const nextWindowState = beginWindowDragModel(state, { windowId, pointer });

    set({
      ...nextWindowState,
    });
  },

  updateWindowDrag: (pointer, bounds) => {
    const state = get();
    const nextWindowState = updateDraggedWindowModel(state, { pointer, bounds });

    const snapZone = state.dragState ? detectSnapZone(pointer, bounds) : null;

    set({
      ...nextWindowState,
      windowSnapZone: snapZone,
    });
  },

  endWindowDrag: () => {
    const state = get();
    const { dragState, windowSnapZone } = state;

    const nextWindowState = endWindowDragModel(state);

    set({
      ...nextWindowState,
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
    const targetWindow = state.windowRecord[windowId];

    if (!targetWindow) return;

    const frame = getSnapFrame(zone, bounds);
    const nextWindows = state.windows.map((w) =>
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
    );

    set({
      windows: nextWindows,
      windowRecord: buildWindowRecord(nextWindows),
    });
  },

  beginWindowResize: (windowId, direction, pointer) => {
    const state = get();
    const nextWindowState = beginWindowResizeModel(state, { windowId, direction, pointer });

    set({
      ...nextWindowState,
    });
  },

  updateWindowResize: (pointer, bounds) => {
    const state = get();
    const nextWindowState = updateResizedWindowModel(state, { pointer, bounds });

    set({
      ...nextWindowState,
    });
  },

  endWindowResize: () => {
    const state = get();
    const nextWindowState = endWindowResizeModel(state);

    set({
      ...nextWindowState,
    });
  },

  resizeWindowsToBounds: (bounds) => {
    const state = get();
    const nextWindowState = resizeWindowsToBoundsModel(state, { bounds, workspaces: state.workspaces });

    set({
      ...nextWindowState,
    });
  },

  closeWindow: (windowId) => {
    const state = get();
    const targetWindow = state.windowRecord[windowId];

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
          windowRecord: buildWindowRecord(collapsedSplit.windows),
          workspaces: collapsedSplit.workspaces,
          splitResizeState: collapsedSplit.splitResizeState,
          activeWindowId: collapsedSplit.activeWindowId,
        }
      : state;
    const nextProcessState = stopProcessModel(
      { processes: baseState.processes, processRecord: baseState.processRecord },
      targetWindow.processId,
    );
    const nextWindowState = closeWindowModel(baseState, windowId);
    const isSingleFullscreen = targetWindow.isFullscreen && !collapsedSplit;
    const nextWorkspaceState = isSingleFullscreen
      ? removeWorkspaceModel(baseState, targetWindow.workspaceId)
      : null;
    const fallbackWorkspaceId = targetWindow.isFullscreen
      ? targetWindow.fullscreenRestoreWorkspaceId ??
        nextWorkspaceState?.currentWorkspaceId ??
        baseState.currentWorkspaceId
      : baseState.currentWorkspaceId;

    const nextDirtyWindows = new Set(state.dirtyWindows);
    nextDirtyWindows.delete(windowId);
    set({
      windows: nextWindowState.state.windows,
      windowRecord: nextWindowState.state.windowRecord,
      currentWorkspaceId: fallbackWorkspaceId,
      workspaces: nextWorkspaceState?.workspaces ?? baseState.workspaces,
      splitResizeState: nextWorkspaceState?.splitResizeState ?? baseState.splitResizeState,
      activeWindowId: nextWindowState.state.activeWindowId,
      nextZIndex: nextWindowState.state.nextZIndex,
      dragState: nextWindowState.state.dragState,
      resizeState: nextWindowState.state.resizeState,
      processes: nextProcessState.processes,
      processRecord: nextProcessState.processRecord,
      dirtyWindows: nextDirtyWindows,
      hasDirtyWindows: nextDirtyWindows.size > 0,
    });
  },

  terminateProcess: (processId) => {
    const state = get();
    const targetProcess = state.processRecord[processId];

    if (!targetProcess) {
      return;
    }

    const processWindow = targetProcess.windowId ? state.windowRecord[targetProcess.windowId] : undefined;
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
          windowRecord: buildWindowRecord(collapsedSplit.windows),
          workspaces: collapsedSplit.workspaces,
          splitResizeState: collapsedSplit.splitResizeState,
          activeWindowId: collapsedSplit.activeWindowId,
        }
      : state;
    const nextProcessState = stopProcessModel(
      { processes: baseState.processes, processRecord: baseState.processRecord },
      processId,
    );

    if (!targetProcess.windowId) {
      set({
        processes: nextProcessState.processes,
        processRecord: nextProcessState.processRecord,
      });
      return;
    }

    const nextWindowState = closeWindowModel(baseState, targetProcess.windowId);

    set({
      processes: nextProcessState.processes,
      processRecord: nextProcessState.processRecord,
      windows: nextWindowState.state.windows,
      windowRecord: nextWindowState.state.windowRecord,
      workspaces: baseState.workspaces,
      splitResizeState: baseState.splitResizeState,
      activeWindowId: nextWindowState.state.activeWindowId,
      nextZIndex: nextWindowState.state.nextZIndex,
      dragState: nextWindowState.state.dragState,
      resizeState: nextWindowState.state.resizeState,
    });
  },
});
