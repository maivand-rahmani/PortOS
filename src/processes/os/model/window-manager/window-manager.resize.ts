import type { DesktopBounds, WindowFrame, WindowPosition } from "@/entities/window";

import { buildWindowRecord, clampWindowPosition, replaceWindow, resolveWindowSize } from "./window-manager.helpers";
import type {
  WindowManagerState,
  WindowResizeDirection,
} from "./window-manager.types";

type WindowResizeInput = {
  windowId: string;
  direction: WindowResizeDirection;
  pointer: WindowPosition;
};

type UpdateResizedWindowInput = {
  pointer: WindowPosition;
  bounds: DesktopBounds;
};

function directionIncludes(direction: WindowResizeDirection, axis: "n" | "s" | "e" | "w") {
  return direction.includes(axis);
}

function resolveResizedFrame(
  input: {
    direction: WindowResizeDirection;
    frame: WindowFrame;
    minSize: WindowFrame["size"];
    pointer: WindowPosition;
    originPointer: WindowPosition;
  },
  bounds: DesktopBounds,
): WindowFrame {
  const deltaX = input.pointer.x - input.originPointer.x;
  const deltaY = input.pointer.y - input.originPointer.y;
  const maxRight = bounds.width - bounds.insetRight;
  const maxBottom = bounds.height - bounds.insetBottom;

  let left = input.frame.position.x;
  let top = input.frame.position.y;
  let right = input.frame.position.x + input.frame.size.width;
  let bottom = input.frame.position.y + input.frame.size.height;

  if (directionIncludes(input.direction, "w")) {
    left = Math.min(
      Math.max(input.frame.position.x + deltaX, bounds.insetLeft),
      right - input.minSize.width,
    );
  }

  if (directionIncludes(input.direction, "e")) {
    right = Math.max(
      Math.min(input.frame.position.x + input.frame.size.width + deltaX, maxRight),
      left + input.minSize.width,
    );
  }

  if (directionIncludes(input.direction, "n")) {
    top = Math.min(
      Math.max(input.frame.position.y + deltaY, bounds.insetTop),
      bottom - input.minSize.height,
    );
  }

  if (directionIncludes(input.direction, "s")) {
    bottom = Math.max(
      Math.min(input.frame.position.y + input.frame.size.height + deltaY, maxBottom),
      top + input.minSize.height,
    );
  }

  const size = resolveWindowSize(
    {
      width: right - left,
      height: bottom - top,
    },
    input.minSize,
    bounds,
  );

  return {
    position: clampWindowPosition(
      {
        x: left,
        y: top,
      },
      size,
      bounds,
    ),
    size,
  };
}

export function beginWindowResizeModel(
  state: WindowManagerState,
  input: WindowResizeInput,
): WindowManagerState {
  const targetWindow = state.windowRecord[input.windowId];

  if (
    !targetWindow ||
    targetWindow.isMinimized ||
    targetWindow.isMaximized ||
    targetWindow.isFullscreen
  ) {
    return {
      ...state,
      dragState: null,
      resizeState: null,
    };
  }

  return {
    ...state,
    dragState: null,
    resizeState: {
      windowId: input.windowId,
      direction: input.direction,
      originPointer: input.pointer,
      originFrame: {
        position: targetWindow.position,
        size: targetWindow.size,
      },
    },
  };
}

export function updateResizedWindowModel(
  state: WindowManagerState,
  input: UpdateResizedWindowInput,
): WindowManagerState {
  if (!state.resizeState) {
    return state;
  }

  const targetWindow = state.windowRecord[state.resizeState.windowId];

  if (
    !targetWindow ||
    targetWindow.isMinimized ||
    targetWindow.isMaximized ||
    targetWindow.isFullscreen
  ) {
    return {
      ...state,
      resizeState: null,
    };
  }

  const nextFrame = resolveResizedFrame(
    {
      direction: state.resizeState.direction,
      frame: state.resizeState.originFrame,
      minSize: targetWindow.minSize,
      pointer: input.pointer,
      originPointer: state.resizeState.originPointer,
    },
    input.bounds,
  );

  const nextWindows = replaceWindow(state.windows, targetWindow.id, (window) => ({
    ...window,
    position: nextFrame.position,
    size: nextFrame.size,
  }));

  return {
    ...state,
    windows: nextWindows,
    windowRecord: buildWindowRecord(nextWindows),
  };
}

export function endWindowResizeModel(state: WindowManagerState): WindowManagerState {
  if (!state.resizeState) {
    return state;
  }

  return {
    ...state,
    resizeState: null,
  };
}
