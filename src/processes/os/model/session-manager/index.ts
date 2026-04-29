import type { AppConfigMap } from "@/entities/app";
import type { WorkspaceDefinition } from "@/entities/workspace";
import type { DesktopBounds, WindowFrame, WindowInstance } from "@/entities/window";

import {
  buildWindowRecord,
  clampWindowPosition,
  getFullscreenFrame,
  resolveWindowSize,
} from "../window-manager/window-manager.helpers";
import { buildProcessRecord } from "../process-manager";
import type { ProcessManagerState } from "../process-manager";
import type { WindowManagerState } from "../window-manager";
import type {
  PersistedSessionState,
  PersistedSessionStateV3,
  PersistedSessionStateV4,
  PersistedWindowSession,
  SessionManagerState,
} from "./session-manager.types";
import { DEFAULT_WORKSPACES } from "../workspace-manager/workspace-manager.types";

export type { PersistedSessionState, PersistedWindowSession, SessionManagerState } from "./session-manager.types";
export { loadPersistedSession } from "./session-manager.storage";

export const SESSION_STORAGE_VERSION = 4 as const;

export const sessionManagerInitialState: SessionManagerState = {
  sessionHydrated: false,
};

function normalizePersistedWorkspaces(
  workspaces: WorkspaceDefinition[] | undefined,
  windows: PersistedWindowSession[],
) {
  const baseDesktops = DEFAULT_WORKSPACES.map((workspace) => ({ ...workspace }));
  const fullscreenWorkspaces = workspaces
    ? workspaces.filter((w) => w.kind === "fullscreen")
    : [];
  const nextWorkspaces = [...baseDesktops, ...fullscreenWorkspaces];

  const knownIds = new Set(nextWorkspaces.map((workspace) => workspace.id));

  windows.forEach((window) => {
    if (window.isFullscreen && !knownIds.has(window.workspaceId)) {
      nextWorkspaces.push({
        id: window.workspaceId,
        label: window.title,
        order: nextWorkspaces.length + 1,
        kind: "fullscreen",
        ownerWindowId: window.id,
        splitView: null,
      });
      knownIds.add(window.workspaceId);
    }
  });

  return nextWorkspaces
    .sort((left, right) => left.order - right.order)
    .map((workspace, index) => ({
      ...workspace,
      order: index + 1,
    }));
}

export function migratePersistedSession(
  session: PersistedSessionState,
): PersistedSessionStateV4 | null {
  if (session.version === 4) {
    return {
      ...session,
      workspaces: normalizePersistedWorkspaces(session.workspaces, session.windows),
    };
  }

  if (session.version === 3) {
    return {
      version: SESSION_STORAGE_VERSION,
      currentWorkspaceId: session.currentWorkspaceId,
      activeWindowId: session.activeWindowId,
      workspaces: normalizePersistedWorkspaces(session.workspaces, session.windows).map(
        (workspace) => ({
          ...workspace,
          splitView: workspace.splitView ?? null,
        }),
      ),
      windows: session.windows,
      savedAt: session.savedAt,
    };
  }

  if (session.version === 2) {
    return {
      version: SESSION_STORAGE_VERSION,
      currentWorkspaceId: session.currentWorkspaceId,
      activeWindowId: session.activeWindowId,
      workspaces: normalizePersistedWorkspaces(session.workspaces, session.windows).map(
        (workspace) => ({
          ...workspace,
          splitView: workspace.splitView ?? null,
        }),
      ),
      windows: session.windows,
      savedAt: session.savedAt,
    };
  }

  if (session.version !== 1 || !Array.isArray(session.windows)) {
    return null;
  }

  const orderedWindows = session.windows.map((window, index) => ({
    ...window,
    id: `persisted-window-${index + 1}`,
    isFullscreen: false,
    fullscreenRestoreWorkspaceId: null,
    fullscreenRestoreMaximized: false,
  }));
  const activeWindow =
    session.activeWindowIndex != null && session.activeWindowIndex >= 0
      ? orderedWindows[session.activeWindowIndex] ?? null
      : null;

  return {
    version: SESSION_STORAGE_VERSION,
    currentWorkspaceId: session.currentWorkspaceId,
    activeWindowId: activeWindow?.id ?? null,
    workspaces: normalizePersistedWorkspaces(undefined, orderedWindows),
    windows: orderedWindows,
    savedAt: session.savedAt,
  };
}

export function serializeSessionModel(input: {
  workspaces: WorkspaceDefinition[];
  windows: WindowInstance[];
  activeWindowId: string | null;
  currentWorkspaceId: PersistedSessionState["currentWorkspaceId"];
}): PersistedSessionStateV4 {
  const orderedWindows = [...input.windows].sort((left, right) => left.zIndex - right.zIndex);

  return {
    version: SESSION_STORAGE_VERSION,
    currentWorkspaceId: input.currentWorkspaceId,
    activeWindowId: input.activeWindowId,
    workspaces: normalizePersistedWorkspaces(input.workspaces, []),
    windows: orderedWindows.map((window) => ({
      id: window.id,
      appId: window.appId,
      workspaceId: window.workspaceId,
      title: window.title,
      position: window.position,
      size: window.size,
      minSize: window.minSize,
      isMinimized: window.isMinimized,
      isMaximized: window.isMaximized,
      isFullscreen: window.isFullscreen,
      restoredFrame: window.restoredFrame,
      fullscreenRestoreWorkspaceId: window.fullscreenRestoreWorkspaceId,
      fullscreenRestoreMaximized: window.fullscreenRestoreMaximized,
    })),
    savedAt: new Date().toISOString(),
  };
}

export function sanitizePersistedWindow(
  sessionWindow: PersistedWindowSession,
  bounds: DesktopBounds,
): PersistedWindowSession {
  if (sessionWindow.isFullscreen) {
    const fullscreenFrame = getFullscreenFrame(bounds);

    return {
      ...sessionWindow,
      size: fullscreenFrame.size,
      position: fullscreenFrame.position,
      restoredFrame: sessionWindow.restoredFrame
        ? sanitizeFrame(sessionWindow.restoredFrame, sessionWindow.minSize, bounds)
        : null,
    };
  }

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
  session: PersistedSessionStateV4;
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
    const windowId = persistedWindow.id;

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
      isFullscreen: sanitizedWindow.isFullscreen,
      restoredFrame: sanitizedWindow.restoredFrame,
      fullscreenRestoreWorkspaceId: sanitizedWindow.fullscreenRestoreWorkspaceId,
      fullscreenRestoreMaximized: sanitizedWindow.fullscreenRestoreMaximized,
    });

    if (input.session.activeWindowId === persistedWindow.id) {
      restoredActiveWindowId = windowId;
    }

    nextZIndex += 1;
  });

  return {
    windows: {
      windows: restoredWindows,
      windowRecord: buildWindowRecord(restoredWindows),
      activeWindowId: restoredActiveWindowId,
      nextZIndex,
      dragState: null,
      resizeState: null,
    },
    processes: {
      processes: restoredProcesses,
      processRecord: buildProcessRecord(restoredProcesses),
    },
  };
}
