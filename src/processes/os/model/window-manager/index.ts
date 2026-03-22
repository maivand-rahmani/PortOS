import type { AppConfig } from "@/entities/app";
import type { WindowInstance, WindowPosition } from "@/entities/window";

export type WindowManagerState = {
  windows: WindowInstance[];
  activeWindowId: string | null;
  nextZIndex: number;
};

type OpenWindowInput = {
  app: Pick<AppConfig, "id" | "name" | "window">;
  processId: string;
  instanceIndex: number;
};

const WINDOW_ORIGIN: WindowPosition = {
  x: 24,
  y: 148,
};

const WINDOW_OFFSET: WindowPosition = {
  x: 28,
  y: 24,
};

export const windowManagerInitialState: WindowManagerState = {
  windows: [],
  activeWindowId: null,
  nextZIndex: 10,
};

export function createWindowManagerModel(
  overrides: Partial<WindowManagerState> = {},
): WindowManagerState {
  return {
    ...windowManagerInitialState,
    ...overrides,
  };
}

export function openWindowModel(
  state: WindowManagerState,
  input: OpenWindowInput,
) {
  const position = {
    x: WINDOW_ORIGIN.x + (input.instanceIndex % 4) * WINDOW_OFFSET.x,
    y: WINDOW_ORIGIN.y + (input.instanceIndex % 4) * WINDOW_OFFSET.y,
  };

  const window: WindowInstance = {
    id: crypto.randomUUID(),
    appId: input.app.id,
    processId: input.processId,
    title: input.app.name,
    position,
    size: {
      width: input.app.window.width,
      height: input.app.window.height,
    },
    zIndex: state.nextZIndex,
  };

  return {
    state: {
      windows: [...state.windows, window],
      activeWindowId: window.id,
      nextZIndex: state.nextZIndex + 1,
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
    windows: state.windows.map((window) =>
      window.id === windowId
        ? {
            ...window,
            zIndex: state.nextZIndex,
          }
        : window,
    ),
    activeWindowId: windowId,
    nextZIndex: state.nextZIndex + 1,
  };
}

export function closeWindowModel(
  state: WindowManagerState,
  windowId: string,
) {
  const nextWindows = state.windows.filter((window) => window.id !== windowId);
  const nextActiveWindow = [...nextWindows].sort((left, right) => right.zIndex - left.zIndex)[0];

  return {
    state: {
      windows: nextWindows,
      activeWindowId: nextActiveWindow?.id ?? null,
      nextZIndex: Math.max(
        state.nextZIndex,
        (nextActiveWindow?.zIndex ?? windowManagerInitialState.nextZIndex) + 1,
      ),
    },
  };
}
