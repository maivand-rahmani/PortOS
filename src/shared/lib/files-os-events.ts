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

  localStorage.setItem(FILES_FOCUS_NODE_KEY, JSON.stringify(detail));
  window.dispatchEvent(new CustomEvent(FILES_FOCUS_NODE_EVENT, { detail }));
}

export function consumeFilesFocusNodeRequest(
  targetWindowId?: string,
): FilesFocusNodeRequest | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(FILES_FOCUS_NODE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as FilesFocusNodeRequest;

    if (targetWindowId && parsed.targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    localStorage.removeItem(FILES_FOCUS_NODE_KEY);

    return parsed;
  } catch {
    localStorage.removeItem(FILES_FOCUS_NODE_KEY);

    return null;
  }
}

export const FILES_EVENTS = {
  FOCUS_NODE: FILES_FOCUS_NODE_EVENT,
} as const;
