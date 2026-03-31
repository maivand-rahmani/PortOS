import type { AppConfig } from "@/entities/app";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";
import type { WorkspaceId } from "@/entities/workspace";

import {
  clampWindowPosition,
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
    restoredFrame: null,
  };

  return {
    state: {
      windows: [...state.windows, window],
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
  if (!state.windows.some((window) => window.id === windowId)) {
    return state;
  }

  return {
    windows: replaceWindow(state.windows, windowId, (window) => ({
      ...window,
      zIndex: state.nextZIndex,
    })),
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
  const targetWindow = focusedState.windows.find((window) => window.id === input.windowId);

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

  const targetWindow = state.windows.find((window) => window.id === state.dragState?.windowId);

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

  return {
    ...state,
    windows: replaceWindow(state.windows, targetWindow.id, (window) => ({
      ...window,
      position,
    })),
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
  if (!state.windows.some((window) => window.id === windowId)) {
    return state;
  }

  return {
    windows: replaceWindow(state.windows, windowId, (window) => ({
      ...window,
      isMinimized: false,
      zIndex: state.nextZIndex,
    })),
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
  const targetWindow = focusedState.windows.find((window) => window.id === input.windowId);

  if (!targetWindow || targetWindow.isMinimized) {
    return focusedState;
  }

  const maximizedFrame = getWindowFrameFromBounds(input.bounds);

  return {
    windows: replaceWindow(focusedState.windows, input.windowId, (window) => {
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
    }),
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

export function resizeWindowsToBoundsModel(
  state: WindowManagerState,
  bounds: DesktopBounds,
): WindowManagerState {
  return {
    ...state,
    windows: state.windows.map((window) => {
      if (window.isMaximized) {
        const frame = getWindowFrameFromBounds(bounds);

        return {
          ...window,
          position: frame.position,
          size: frame.size,
        };
      }

      const size = resolveWindowSize(window.size, window.minSize, bounds);

      return {
        ...window,
        size,
        position: clampWindowPosition(window.position, size, bounds),
      };
    }),
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
