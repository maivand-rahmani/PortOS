import type { AppConfig } from "@/entities/app";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";
import type { WorkspaceDefinition, WorkspaceId, WorkspaceSplitView } from "@/entities/workspace";

import {
  buildWindowRecord,
  clampWindowPosition,
  clampSplitViewRatio,
  getFullscreenFrame,
  getSplitViewFrames,
  getTopVisibleWindowId,
  getWindowFrameFromBounds,
  replaceWindow,
  resolveWindowSize,
} from "./window-manager.helpers";
import {
  beginWindowResizeModel as beginWindowResizeStateModel,
  endWindowResizeModel,
  updateResizedWindowModel,
} from "./window-manager.resize";
import {
  createWindowManagerModel,
  type WindowDragState,
  type WindowManagerState,
  type WindowResizeDirection,
  type WindowResizeState,
  windowManagerInitialState,
} from "./window-manager.types";

type OpenWindowInput = {
  app: Pick<AppConfig, "id" | "name" | "window">;
  processId: string;
  instanceIndex: number;
  bounds?: DesktopBounds;
  workspaceId: WorkspaceId;
};

type WindowDragInput = {
  pointer: WindowPosition;
  windowId: string;
};

type UpdateDraggedWindowInput = {
  pointer: WindowPosition;
  bounds: DesktopBounds;
};

type MaximizeWindowInput = {
  windowId: string;
  bounds: DesktopBounds;
};

type FullscreenWindowInput = {
  windowId: string;
  bounds: Pick<DesktopBounds, "width" | "height">;
  restoreWorkspaceId: WorkspaceId;
  fullscreenWorkspaceId: WorkspaceId;
};

type ExitFullscreenWindowInput = {
  windowId: string;
  bounds: DesktopBounds;
};

type ApplySplitViewInput = {
  workspaceId: WorkspaceId;
  splitView: WorkspaceSplitView;
  bounds: Pick<DesktopBounds, "width" | "height">;
};

type ResizeWindowsToBoundsInput = {
  bounds: DesktopBounds;
  workspaces?: WorkspaceDefinition[];
};

type WindowResizeInput = {
  pointer: WindowPosition;
  windowId: string;
  direction: WindowResizeDirection;
};

const WINDOW_ORIGIN: WindowPosition = {
  x: 96,
  y: 72,
};

const WINDOW_OFFSET: WindowPosition = {
  x: 34,
  y: 28,
};

export { createWindowManagerModel, windowManagerInitialState };
export type {
  WindowDragState,
  WindowManagerState,
  WindowResizeDirection,
  WindowResizeState,
};

export function openWindowModel(
  state: WindowManagerState,
  input: OpenWindowInput,
) {
  const desiredMinSize = {
    width: input.app.window.minWidth ?? 360,
    height: input.app.window.minHeight ?? 280,
  };
  const minSize = input.bounds
    ? resolveWindowSize(desiredMinSize, desiredMinSize, input.bounds)
    : desiredMinSize;
  const size = input.bounds
    ? resolveWindowSize(
        {
          width: input.app.window.width,
          height: input.app.window.height,
        },
        minSize,
        input.bounds,
      )
    : {
        width: input.app.window.width,
        height: input.app.window.height,
      };
  const position = {
    x: WINDOW_ORIGIN.x + (input.instanceIndex % 4) * WINDOW_OFFSET.x,
    y: WINDOW_ORIGIN.y + (input.instanceIndex % 4) * WINDOW_OFFSET.y,
  };
  const nextPosition = input.bounds
    ? clampWindowPosition(position, size, input.bounds)
    : position;

  const window: WindowInstance = {
    id: crypto.randomUUID(),
    appId: input.app.id,
    processId: input.processId,
    workspaceId: input.workspaceId,
    title: input.app.name,
    position: nextPosition,
    size,
    minSize,
      zIndex: state.nextZIndex,
      isMinimized: false,
      isMaximized: false,
      isFullscreen: false,
      restoredFrame: null,
      fullscreenRestoreWorkspaceId: null,
      fullscreenRestoreMaximized: false,
    };

  const nextWindows = [...state.windows, window];

  return {
    state: {
      windows: nextWindows,
      windowRecord: buildWindowRecord(nextWindows),
      activeWindowId: window.id,
      nextZIndex: state.nextZIndex + 1,
      dragState: null,
      resizeState: null,
    },
    window,
  };
}

export function focusWindowModel(
  state: WindowManagerState,
  windowId: string,
): WindowManagerState {
  if (!state.windowRecord[windowId]) {
    return state;
  }

  const nextWindows = replaceWindow(state.windows, windowId, (window) => ({
    ...window,
    zIndex: state.nextZIndex,
  }));

  return {
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
    activeWindowId: windowId,
    nextZIndex: state.nextZIndex + 1,
    dragState: state.dragState,
    resizeState: state.resizeState,
  };
}

export function beginWindowDragModel(
  state: WindowManagerState,
  input: WindowDragInput,
): WindowManagerState {
  const focusedState = focusWindowModel(state, input.windowId);
  const targetWindow = focusedState.windowRecord[input.windowId];

  if (!targetWindow || targetWindow.isMinimized || targetWindow.isMaximized) {
    return {
      ...focusedState,
      dragState: null,
      resizeState: null,
    };
  }

  return {
    ...focusedState,
    dragState: {
      windowId: input.windowId,
      offset: {
        x: input.pointer.x - targetWindow.position.x,
        y: input.pointer.y - targetWindow.position.y,
      },
    },
    resizeState: null,
  };
}

export function updateDraggedWindowModel(
  state: WindowManagerState,
  input: UpdateDraggedWindowInput,
): WindowManagerState {
  if (!state.dragState) {
    return state;
  }

  const targetWindow = state.windowRecord[state.dragState.windowId];

  if (!targetWindow || targetWindow.isMaximized || targetWindow.isMinimized) {
    return {
      ...state,
      dragState: null,
    };
  }

  const position = clampWindowPosition(
    {
      x: input.pointer.x - state.dragState.offset.x,
      y: input.pointer.y - state.dragState.offset.y,
    },
    targetWindow.size,
    input.bounds,
  );

  const nextWindows = replaceWindow(state.windows, targetWindow.id, (window) => ({
    ...window,
    position,
  }));

  return {
    ...state,
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
  };
}

export function endWindowDragModel(state: WindowManagerState): WindowManagerState {
  if (!state.dragState) {
    return state;
  }

  return {
    ...state,
    dragState: null,
  };
}

export function minimizeWindowModel(
  state: WindowManagerState,
  windowId: string,
): WindowManagerState {
  const nextWindows = replaceWindow(state.windows, windowId, (window) => ({
    ...window,
    isMinimized: true,
  }));

  return {
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
    activeWindowId: getTopVisibleWindowId(nextWindows),
    nextZIndex: state.nextZIndex,
    dragState: state.dragState?.windowId === windowId ? null : state.dragState,
    resizeState: state.resizeState?.windowId === windowId ? null : state.resizeState,
  };
}

export function restoreWindowModel(
  state: WindowManagerState,
  windowId: string,
): WindowManagerState {
  if (!state.windowRecord[windowId]) {
    return state;
  }

  const nextWindows = replaceWindow(state.windows, windowId, (window) => ({
    ...window,
    isMinimized: false,
    zIndex: state.nextZIndex,
  }));

  return {
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
    activeWindowId: windowId,
    nextZIndex: state.nextZIndex + 1,
    dragState: null,
    resizeState: null,
  };
}

export function toggleWindowMaximizeModel(
  state: WindowManagerState,
  input: MaximizeWindowInput,
): WindowManagerState {
  const focusedState = focusWindowModel(state, input.windowId);
  const targetWindow = focusedState.windowRecord[input.windowId];

  if (!targetWindow || targetWindow.isMinimized || targetWindow.isFullscreen) {
    return focusedState;
  }

  const maximizedFrame = getWindowFrameFromBounds(input.bounds);
  const nextWindows = replaceWindow(focusedState.windows, input.windowId, (window) => {
    if (window.isMaximized && window.restoredFrame) {
      return {
        ...window,
        position: window.restoredFrame.position,
        size: resolveWindowSize(window.restoredFrame.size, window.minSize, input.bounds),
        isMaximized: false,
        restoredFrame: null,
      };
    }

    return {
      ...window,
      position: maximizedFrame.position,
      size: maximizedFrame.size,
      isMaximized: true,
      restoredFrame: {
        position: window.position,
        size: window.size,
      },
    };
  });

  return {
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
    activeWindowId: input.windowId,
    nextZIndex: focusedState.nextZIndex,
    dragState: null,
    resizeState: null,
  };
}

export function beginWindowResizeModel(
  state: WindowManagerState,
  input: WindowResizeInput,
): WindowManagerState {
  const focusedState = focusWindowModel(state, input.windowId);

  return beginWindowResizeStateModel(focusedState, input);
}

export function enterWindowFullscreenModel(
  state: WindowManagerState,
  input: FullscreenWindowInput,
): WindowManagerState {
  const focusedState = focusWindowModel(state, input.windowId);
  const targetWindow = focusedState.windowRecord[input.windowId];

  if (!targetWindow || targetWindow.isMinimized || targetWindow.isFullscreen) {
    return focusedState;
  }

  const fullscreenFrame = getFullscreenFrame(input.bounds);
  const nextWindows = replaceWindow(focusedState.windows, input.windowId, (window) => ({
    ...window,
    workspaceId: input.fullscreenWorkspaceId,
    position: fullscreenFrame.position,
    size: fullscreenFrame.size,
    isMaximized: false,
    isFullscreen: true,
    restoredFrame: window.isMaximized
      ? window.restoredFrame
      : {
          position: window.position,
          size: window.size,
        },
    fullscreenRestoreWorkspaceId: input.restoreWorkspaceId,
    fullscreenRestoreMaximized: window.isMaximized,
  }));

  return {
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
    activeWindowId: input.windowId,
    nextZIndex: focusedState.nextZIndex,
    dragState: null,
    resizeState: null,
  };
}

export function exitWindowFullscreenModel(
  state: WindowManagerState,
  input: ExitFullscreenWindowInput,
): WindowManagerState {
  const focusedState = focusWindowModel(state, input.windowId);
  const targetWindow = focusedState.windowRecord[input.windowId];

  if (!targetWindow || !targetWindow.isFullscreen || !targetWindow.fullscreenRestoreWorkspaceId) {
    return focusedState;
  }

  const maximizedFrame = getWindowFrameFromBounds(input.bounds);
  const nextWindows = replaceWindow(focusedState.windows, input.windowId, (window) => {
    const restoredFrame = window.restoredFrame;

    return {
      ...window,
      workspaceId: window.fullscreenRestoreWorkspaceId ?? window.workspaceId,
      position: window.fullscreenRestoreMaximized
        ? maximizedFrame.position
        : restoredFrame?.position ?? window.position,
      size: window.fullscreenRestoreMaximized
        ? maximizedFrame.size
        : resolveWindowSize(restoredFrame?.size ?? window.size, window.minSize, input.bounds),
      isMaximized: window.fullscreenRestoreMaximized,
      isFullscreen: false,
      restoredFrame: window.fullscreenRestoreMaximized ? restoredFrame : null,
      fullscreenRestoreWorkspaceId: null,
      fullscreenRestoreMaximized: false,
    };
  });

  return {
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
    activeWindowId: input.windowId,
    nextZIndex: focusedState.nextZIndex,
    dragState: null,
    resizeState: null,
  };
}

export function applySplitViewFramesModel(
  state: WindowManagerState,
  input: ApplySplitViewInput,
): WindowManagerState {
  const leftWindow = state.windowRecord[input.splitView.leftWindowId];
  const rightWindow = state.windowRecord[input.splitView.rightWindowId];

  if (!leftWindow || !rightWindow) {
    return state;
  }

  const frames = getSplitViewFrames(input.bounds, {
    ratio: input.splitView.ratio,
    leftMinWidth: leftWindow.minSize.width,
    rightMinWidth: rightWindow.minSize.width,
  });

  const nextWindows = state.windows.map((window) => {
    if (window.id === leftWindow.id) {
      return {
        ...window,
        workspaceId: input.workspaceId,
        isFullscreen: true,
        position: frames.left.position,
        size: frames.left.size,
      };
    }

    if (window.id === rightWindow.id) {
      return {
        ...window,
        workspaceId: input.workspaceId,
        isFullscreen: true,
        position: frames.right.position,
        size: frames.right.size,
      };
    }

    return window;
  });

  return {
    ...state,
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
  };
}

export function resizeWindowsToBoundsModel(
  state: WindowManagerState,
  input: ResizeWindowsToBoundsInput,
): WindowManagerState {
  const workspaces = input.workspaces ?? [];
  const nextWindows = state.windows.map((window) => {
    const workspace = workspaces.find((entry) => entry.id === window.workspaceId) ?? null;
    const splitView = workspace?.splitView;

    if (
      splitView &&
      (splitView.leftWindowId === window.id || splitView.rightWindowId === window.id)
    ) {
      const siblingId =
        splitView.leftWindowId === window.id ? splitView.rightWindowId : splitView.leftWindowId;
      const siblingWindow = state.windowRecord[siblingId];

      if (!siblingWindow) {
        return window;
      }

      const ratio = clampSplitViewRatio(input.bounds, {
        ratio: splitView.ratio,
        leftMinWidth:
          splitView.leftWindowId === window.id
            ? window.minSize.width
            : siblingWindow.minSize.width,
        rightMinWidth:
          splitView.rightWindowId === window.id
            ? window.minSize.width
            : siblingWindow.minSize.width,
      });
      const frames = getSplitViewFrames(input.bounds, {
        ratio,
        leftMinWidth:
          splitView.leftWindowId === window.id
            ? window.minSize.width
            : siblingWindow.minSize.width,
        rightMinWidth:
          splitView.rightWindowId === window.id
            ? window.minSize.width
            : siblingWindow.minSize.width,
      });

      return {
        ...window,
        position:
          splitView.leftWindowId === window.id
            ? frames.left.position
            : frames.right.position,
        size:
          splitView.leftWindowId === window.id ? frames.left.size : frames.right.size,
      };
    }

    if (window.isFullscreen) {
      const frame = getFullscreenFrame(input.bounds);

      return {
        ...window,
        position: frame.position,
        size: frame.size,
      };
    }

    if (window.isMaximized) {
      const frame = getWindowFrameFromBounds(input.bounds);

      return {
        ...window,
        position: frame.position,
        size: frame.size,
      };
    }

    const size = resolveWindowSize(window.size, window.minSize, input.bounds);

    return {
      ...window,
      size,
      position: clampWindowPosition(window.position, size, input.bounds),
    };
  });

  return {
    ...state,
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
    dragState: state.dragState,
    resizeState: state.resizeState,
  };
}

export function closeWindowModel(
  state: WindowManagerState,
  windowId: string,
) {
  const nextWindows = state.windows.filter((window) => window.id !== windowId);

  return {
    state: {
      windows: nextWindows,
      windowRecord: buildWindowRecord(nextWindows),
      activeWindowId: getTopVisibleWindowId(nextWindows),
      nextZIndex: Math.max(
        state.nextZIndex,
        nextWindows.reduce(
          (highest, window) => Math.max(highest, window.zIndex),
          windowManagerInitialState.nextZIndex,
        ) + 1,
      ),
      dragState: state.dragState?.windowId === windowId ? null : state.dragState,
      resizeState: state.resizeState?.windowId === windowId ? null : state.resizeState,
    },
  };
}

export { endWindowResizeModel, updateResizedWindowModel };
