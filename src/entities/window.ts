import type { WorkspaceId } from "./workspace";

export type WindowPosition = {
  x: number;
  y: number;
};

export type WindowSize = {
  width: number;
  height: number;
};

export type WindowFrame = {
  position: WindowPosition;
  size: WindowSize;
};

export type DesktopBounds = {
  width: number;
  height: number;
  insetTop: number;
  insetRight: number;
  insetBottom: number;
  insetLeft: number;
};

export type WindowInstance = {
  id: string;
  appId: string;
  processId: string;
  workspaceId: WorkspaceId;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  minSize: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  restoredFrame: WindowFrame | null;
};
