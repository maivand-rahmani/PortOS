import type { WindowFrame, WindowInstance, WindowSize } from "@/entities/window";
import type { WorkspaceDefinition, WorkspaceId } from "@/entities/workspace";

export type PersistedWindowSession = {
  id: string;
  appId: string;
  workspaceId: WorkspaceId;
  title: string;
  position: WindowFrame["position"];
  size: WindowFrame["size"];
  minSize: WindowSize;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullscreen: boolean;
  restoredFrame: WindowFrame | null;
  fullscreenRestoreWorkspaceId: WorkspaceId | null;
  fullscreenRestoreMaximized: boolean;
};

export type PersistedWorkspaceSession = WorkspaceDefinition;

export type PersistedSessionStateV1 = {
  version: 1;
  currentWorkspaceId: WorkspaceId;
  activeWindowIndex: number | null;
  windows: Array<
    Omit<
      PersistedWindowSession,
      | "id"
      | "isFullscreen"
      | "fullscreenRestoreWorkspaceId"
      | "fullscreenRestoreMaximized"
    >
  >;
  savedAt: string;
};

export type PersistedSessionStateV2 = {
  version: 2;
  currentWorkspaceId: WorkspaceId;
  activeWindowId: string | null;
  workspaces: PersistedWorkspaceSession[];
  windows: PersistedWindowSession[];
  savedAt: string;
};

export type PersistedSessionStateV3 = {
  version: 3;
  currentWorkspaceId: WorkspaceId;
  activeWindowId: string | null;
  workspaces: PersistedWorkspaceSession[];
  windows: PersistedWindowSession[];
  savedAt: string;
};

export type PersistedSessionStateV4 = {
  version: 4;
  currentWorkspaceId: WorkspaceId;
  activeWindowId: string | null;
  workspaces: PersistedWorkspaceSession[];
  windows: PersistedWindowSession[];
  savedAt: string;
};

export type PersistedSessionState =
  | PersistedSessionStateV1
  | PersistedSessionStateV2
  | PersistedSessionStateV3
  | PersistedSessionStateV4;

export type SessionManagerState = {
  sessionHydrated: boolean;
};

export type SessionRestoreWindow = WindowInstance;
