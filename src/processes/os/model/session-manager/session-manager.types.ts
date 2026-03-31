import type { WindowFrame, WindowInstance, WindowSize } from "@/entities/window";
import type { WorkspaceId } from "@/entities/workspace";

export type PersistedWindowSession = {
  appId: string;
  workspaceId: WorkspaceId;
  title: string;
  position: WindowFrame["position"];
  size: WindowFrame["size"];
  minSize: WindowSize;
  isMinimized: boolean;
  isMaximized: boolean;
  restoredFrame: WindowFrame | null;
};

export type PersistedSessionState = {
  version: 1;
  currentWorkspaceId: WorkspaceId;
  activeWindowIndex: number | null;
  windows: PersistedWindowSession[];
  savedAt: string;
};

export type SessionManagerState = {
  sessionHydrated: boolean;
};

export type SessionRestoreWindow = WindowInstance;
