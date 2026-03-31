import type { WindowPosition } from "@/entities/window";

export type FileDropTargetAppId = "editor" | "files";

export type FileDropTarget = {
  appId: FileDropTargetAppId;
  windowId: string;
};

export type FileDragState = {
  nodeId: string;
  pointer: WindowPosition;
} | null;

export type FileDragManagerState = {
  fileDragState: FileDragState;
  fileDropTarget: FileDropTarget | null;
};
