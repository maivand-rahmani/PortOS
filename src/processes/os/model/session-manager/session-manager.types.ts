import type { WindowFrame, WindowInstance, WindowSize } from "@/entities/window";

export type PersistedWindowSession = {
  appId: string;
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
  activeWindowIndex: number | null;
  windows: PersistedWindowSession[];
  savedAt: string;
};

export type SessionManagerState = {
  sessionHydrated: boolean;
};

export type SessionRestoreWindow = WindowInstance;
