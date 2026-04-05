import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import {
  beginSplitViewResizeModel,
  createDesktopWorkspaceModel,
  cycleWorkspaceModel,
  endSplitViewResizeModel,
  enterSplitViewModel,
  getWorkspaceById,
  getWorkspaceSplitView,
  isFullscreenWorkspace,
  removeWorkspaceModel,
  setSplitViewRatioModel,
  switchWorkspaceModel,
  syncActiveWindowToWorkspace,
  updateWorkspaceSplitViewModel,
  workspaceManagerInitialState,
} from "../../workspace-manager";
import {
  applySplitViewFramesModel,
  exitWindowFullscreenModel,
} from "../../window-manager";
import { collapseSplitWorkspaceForWindow, DEFAULT_LAUNCH_BOUNDS } from "./helpers";

export type WorkspaceSlice = Pick<
  OSStore,
  | "currentWorkspaceId"
  | "workspaces"
  | "splitResizeState"
  | "switchWorkspace"
  | "cycleWorkspace"
  | "createDesktop"
  | "enterSplitView"
  | "setSplitViewRatio"
  | "beginSplitViewResize"
  | "updateSplitViewResize"
  | "endSplitViewResize"
  | "closeFullscreenSpace"
>;

export const createWorkspaceSlice: StateCreator<OSStore, [], [], WorkspaceSlice> = (set, get) => ({
  ...workspaceManagerInitialState,

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

  enterSplitView: (anchorWindowId, companionWindowId, side, bounds) => {
    const state = get();
    const anchorWindow = state.windows.find((w) => w.id === anchorWindowId);
    const companionWindow = state.windows.find((w) => w.id === companionWindowId);

    if (!anchorWindow || !companionWindow || anchorWindowId === companionWindowId) {
      return;
    }

    let runtimeState = state;
    let fullscreenWorkspaceId = anchorWindow.workspaceId;

    if (!anchorWindow.isFullscreen) {
      get().toggleWindowFullscreen(anchorWindowId, bounds);
      runtimeState = get();
      fullscreenWorkspaceId =
        runtimeState.windows.find((w) => w.id === anchorWindowId)?.workspaceId ??
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
    const companionSourceWindow = runtimeState.windows.find((w) => w.id === companionWindowId);
    const nextWindows = runtimeState.windows.map((w) => {
      if (w.id !== companionWindowId) {
        return w;
      }

      return {
        ...w,
        workspaceId: fullscreenWorkspaceId,
        isMinimized: false,
        isFullscreen: true,
        fullscreenRestoreWorkspaceId:
          w.fullscreenRestoreWorkspaceId ??
          companionSourceWindow?.workspaceId ??
          runtimeState.currentWorkspaceId,
        fullscreenRestoreMaximized:
          w.fullscreenRestoreWorkspaceId != null
            ? w.fullscreenRestoreMaximized
            : w.isMaximized,
        restoredFrame:
          w.fullscreenRestoreWorkspaceId != null
            ? w.restoredFrame
            : w.isMaximized
              ? w.restoredFrame
              : {
                  position: w.position,
                  size: w.size,
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

    const leftWindow = state.windows.find((w) => w.id === splitView.leftWindowId);
    const rightWindow = state.windows.find((w) => w.id === splitView.rightWindowId);

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

    for (const win of windowsInSpace) {
      const exitResult = exitWindowFullscreenModel(
        {
          windows: finalWindows,
          activeWindowId: state.activeWindowId,
          nextZIndex: state.nextZIndex,
          dragState: state.dragState,
          resizeState: state.resizeState,
        },
        {
          windowId: win.id,
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
});
