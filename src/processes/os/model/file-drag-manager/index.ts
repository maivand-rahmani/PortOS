import type { WindowPosition } from "@/entities/window";

import type {
  FileDragManagerState,
  FileDropTarget,
} from "./file-drag-manager.types";

export type {
  FileDragManagerState,
  FileDragState,
  FileDropTarget,
  FileDropTargetAppId,
} from "./file-drag-manager.types";

export const fileDragManagerInitialState: FileDragManagerState = {
  fileDragState: null,
  fileDropTarget: null,
};

export function beginFileDragModel(
  state: FileDragManagerState,
  input: { nodeId: string; pointer: WindowPosition },
): FileDragManagerState {
  return {
    ...state,
    fileDragState: {
      nodeId: input.nodeId,
      pointer: input.pointer,
    },
    fileDropTarget: null,
  };
}

export function updateFileDragModel(
  state: FileDragManagerState,
  pointer: WindowPosition,
): FileDragManagerState {
  if (!state.fileDragState) {
    return state;
  }

  return {
    ...state,
    fileDragState: {
      ...state.fileDragState,
      pointer,
    },
  };
}

export function setFileDropTargetModel(
  state: FileDragManagerState,
  target: FileDropTarget | null,
): FileDragManagerState {
  return {
    ...state,
    fileDropTarget: target,
  };
}

export function endFileDragModel(): FileDragManagerState {
  return {
    fileDragState: null,
    fileDropTarget: null,
  };
}
