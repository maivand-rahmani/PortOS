import type { AppConfigMap } from "@/entities/app";
import type { DesktopBounds, WindowFrame, WindowInstance } from "@/entities/window";

import { clampWindowPosition, resolveWindowSize } from "../window-manager/window-manager.helpers";
import type { ProcessManagerState } from "../process-manager";
import type { WindowManagerState } from "../window-manager";
import type {
  PersistedSessionState,
  PersistedWindowSession,
  SessionManagerState,
} from "./session-manager.types";

export type { PersistedSessionState, PersistedWindowSession, SessionManagerState } from "./session-manager.types";

export const SESSION_STORAGE_KEY = "os-window-session";
export const SESSION_STORAGE_VERSION = 1 as const;

export const sessionManagerInitialState: SessionManagerState = {
  sessionHydrated: false,
};

export function serializeSessionModel(input: {
  windows: WindowInstance[];
  activeWindowId: string | null;
  currentWorkspaceId: PersistedSessionState["currentWorkspaceId"];
}): PersistedSessionState {
  const orderedWindows = [...input.windows].sort((left, right) => left.zIndex - right.zIndex);
  const activeWindowIndex = orderedWindows.findIndex(
    (window) => window.id === input.activeWindowId,
  );

  return {
    version: SESSION_STORAGE_VERSION,
    currentWorkspaceId: input.currentWorkspaceId,
    activeWindowIndex: activeWindowIndex >= 0 ? activeWindowIndex : null,
    windows: orderedWindows.map((window) => ({
      appId: window.appId,
      workspaceId: window.workspaceId,
      title: window.title,
      position: window.position,
      size: window.size,
      minSize: window.minSize,
      isMinimized: window.isMinimized,
      isMaximized: window.isMaximized,
      restoredFrame: window.restoredFrame,
    })),
    savedAt: new Date().toISOString(),
  };
}

export function sanitizePersistedWindow(
  sessionWindow: PersistedWindowSession,
  bounds: DesktopBounds,
): PersistedWindowSession {
  const size = resolveWindowSize(sessionWindow.size, sessionWindow.minSize, bounds);
  const position = clampWindowPosition(sessionWindow.position, size, bounds);

  return {
    ...sessionWindow,
    size,
    position,
    restoredFrame: sessionWindow.restoredFrame
      ? sanitizeFrame(sessionWindow.restoredFrame, sessionWindow.minSize, bounds)
      : null,
  };
}

function sanitizeFrame(
  frame: WindowFrame,
  minSize: PersistedWindowSession["minSize"],
  bounds: DesktopBounds,
): WindowFrame {
  const size = resolveWindowSize(frame.size, minSize, bounds);

  return {
    size,
    position: clampWindowPosition(frame.position, size, bounds),
  };
}

export function restoreSessionModel(input: {
  session: PersistedSessionState;
  bounds: DesktopBounds;
  appMap: AppConfigMap;
  windowState: WindowManagerState;
  processState: ProcessManagerState;
}): {
  windows: WindowManagerState;
  processes: ProcessManagerState;
} {
  let nextZIndex = input.windowState.nextZIndex;
  let restoredActiveWindowId: string | null = null;

  const restoredWindows: WindowInstance[] = [];
  const restoredProcesses = [...input.processState.processes];

  input.session.windows.forEach((persistedWindow, index) => {
    const app = input.appMap[persistedWindow.appId];

    if (!app) {
      return;
    }

    const sanitizedWindow = sanitizePersistedWindow(persistedWindow, input.bounds);
    const processId = crypto.randomUUID();
    const windowId = crypto.randomUUID();

    restoredProcesses.push({
      id: processId,
      appId: app.id,
      name: app.name,
      windowId,
      startedAt: Date.now() + index,
      status: "running",
    });

    restoredWindows.push({
      id: windowId,
      appId: app.id,
      processId,
      workspaceId: sanitizedWindow.workspaceId,
      title: sanitizedWindow.title,
      position: sanitizedWindow.position,
      size: sanitizedWindow.size,
      minSize: sanitizedWindow.minSize,
      zIndex: nextZIndex,
      isMinimized: sanitizedWindow.isMinimized,
      isMaximized: sanitizedWindow.isMaximized,
      restoredFrame: sanitizedWindow.restoredFrame,
    });

    if (input.session.activeWindowIndex === index) {
      restoredActiveWindowId = windowId;
    }

    nextZIndex += 1;
  });

  return {
    windows: {
      windows: restoredWindows,
      activeWindowId: restoredActiveWindowId,
      nextZIndex,
      dragState: null,
      resizeState: null,
    },
    processes: {
      processes: restoredProcesses,
    },
  };
}
