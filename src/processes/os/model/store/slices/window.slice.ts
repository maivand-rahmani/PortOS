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
import {
  detectSnapZone,
  getSnapFrame,
} from "../../window-manager/window-manager.snap";
import {
  removeWorkspaceModel,
  createFullscreenWorkspaceModel,
} from "../../workspace-manager";
import { stopProcessModel } from "../../process-manager";
import { collapseSplitWorkspaceForWindow, DEFAULT_LAUNCH_BOUNDS } from "./helpers";

export type WindowSlice = Pick<
  OSStore,
  | "windows"
  | "activeWindowId"
  | "nextZIndex"
  | "dragState"
  | "resizeState"
  | "windowSnapZone"
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
>;

export const createWindowSlice: StateCreator<OSStore, [], [], WindowSlice> = (set, get) => ({
  ...createWindowManagerModel(),
  windowSnapZone: null,

  focusWindow: (windowId) => {
    const state = get();
    const targetWindow = state.windows.find((w) => w.id === windowId);

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
    const targetWindow = state.windows.find((w) => w.id === windowId);

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
    const targetWindow = state.windows.find((w) => w.id === windowId);

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

    const restoredWindow = nextWindowState.windows.find((w) => w.id === windowId);

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
      { windowId, bounds },
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
    const targetWindow = state.windows.find((w) => w.id === windowId);

    if (!targetWindow) {
      return;
    }

    if (targetWindow.isFullscreen) {
      const collapsedSplit = collapseSplitWorkspaceForWindow({ state, windowId, bounds });

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
        const restoredWindow = nextWindowState.windows.find((w) => w.id === windowId);

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
      const restoredWindow = nextWindowState.windows.find((w) => w.id === windowId);

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
      { windowId, pointer },
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
      { pointer, bounds },
    );

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
      { windowId, direction, pointer },
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
      { pointer, bounds },
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
      { bounds, workspaces: state.workspaces },
    );

    set({
      windows: nextWindowState.windows,
      dragState: nextWindowState.dragState,
      resizeState: nextWindowState.resizeState,
    });
  },

  closeWindow: (windowId) => {
    const state = get();
    const targetWindow = state.windows.find((w) => w.id === windowId);

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
      { processes: baseState.processes },
      targetWindow.processId,
    );
    const isSingleFullscreen = targetWindow.isFullscreen && !collapsedSplit;
    const nextWorkspaceState = isSingleFullscreen
      ? removeWorkspaceModel(baseState, targetWindow.workspaceId)
      : null;
    const fallbackWorkspaceId = targetWindow.isFullscreen
      ? targetWindow.fullscreenRestoreWorkspaceId ??
        nextWorkspaceState?.currentWorkspaceId ??
        baseState.currentWorkspaceId
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
    const targetProcess = state.processes.find((p) => p.id === processId);

    if (!targetProcess) {
      return;
    }

    const processWindow = state.windows.find((w) => w.id === targetProcess.windowId);
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
      { processes: baseState.processes },
      processId,
    );

    if (!targetProcess.windowId) {
      set({ processes: nextProcessState.processes });
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
});
