import type { WindowFrame, WindowInstance, WindowPosition } from "@/entities/window";

export type WindowDragState = {
  windowId: string;
  offset: WindowPosition;
};

export type WindowResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type WindowResizeState = {
  windowId: string;
  direction: WindowResizeDirection;
  originPointer: WindowPosition;
  originFrame: WindowFrame;
};

export type WindowManagerState = {
  windows: WindowInstance[];
  activeWindowId: string | null;
  nextZIndex: number;
  dragState: WindowDragState | null;
  resizeState: WindowResizeState | null;
};

export const windowManagerInitialState: WindowManagerState = {
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,
  dragState: null,
  resizeState: null,
};

export function createWindowManagerModel(
  overrides: Partial<WindowManagerState> = {},
): WindowManagerState {
  return {
    ...windowManagerInitialState,
    ...overrides,
  };
}
