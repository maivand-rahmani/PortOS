import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

const FILES_FOCUS_NODE_KEY = "portos-files-focus-node-request";
const FILES_FOCUS_NODE_EVENT = "portos:files-focus-node-request";

export type FilesFocusNodeRequest = {
  nodeId: string;
  targetWindowId?: string;
  source?: string;
};

export function dispatchFilesFocusNodeRequest(detail: FilesFocusNodeRequest): void {
  if (typeof window === "undefined") {
    return;
  }

  dispatchWindowRequest(FILES_FOCUS_NODE_KEY, FILES_FOCUS_NODE_EVENT, detail);
}

export function consumeFilesFocusNodeRequest(
  targetWindowId?: string,
): FilesFocusNodeRequest | null {
  return consumeWindowRequest<FilesFocusNodeRequest>(
    FILES_FOCUS_NODE_KEY,
    targetWindowId,
  );
}

export const FILES_EVENTS = {
  FOCUS_NODE: FILES_FOCUS_NODE_EVENT,
} as const;
