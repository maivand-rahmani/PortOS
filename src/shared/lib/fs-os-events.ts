// ── File System OS Events ───────────────────────────────
// Inter-app communication for file operations.
// Follows the same dispatch/consume pattern as other OS events.

import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

const OPEN_FILE_KEY = "portos-fs-open-file-request";
const OPEN_FILE_EVENT = "portos:fs-open-file-request";

const SAVE_FILE_KEY = "portos-fs-save-file-request";
const SAVE_FILE_EVENT = "portos:fs-save-file-request";

// ── Open File Request ───────────────────────────────────

export type OpenFileRequest = {
  nodeId: string;
  path: string;
  appId?: string;
  mode?: "view" | "edit";
  source?: string;
  targetWindowId?: string;
};

export function dispatchOpenFileRequest(detail: OpenFileRequest): void {
  if (typeof window === "undefined") {
    return;
  }

  dispatchWindowRequest(OPEN_FILE_KEY, OPEN_FILE_EVENT, detail);
}

export function consumeOpenFileRequest(
  targetWindowId?: string,
): OpenFileRequest | null {
  return consumeWindowRequest<OpenFileRequest>(OPEN_FILE_KEY, targetWindowId);
}

// ── Save File Request ───────────────────────────────────

export type SaveFileRequest = {
  nodeId: string;
  content: string;
  source?: string;
  targetWindowId?: string;
};

export function dispatchSaveFileRequest(detail: SaveFileRequest): void {
  if (typeof window === "undefined") {
    return;
  }

  dispatchWindowRequest(SAVE_FILE_KEY, SAVE_FILE_EVENT, detail);
}

export function consumeSaveFileRequest(
  targetWindowId?: string,
): SaveFileRequest | null {
  return consumeWindowRequest<SaveFileRequest>(SAVE_FILE_KEY, targetWindowId);
}

// ── Event Name Constants ────────────────────────────────

export const FS_EVENTS = {
  OPEN_FILE: OPEN_FILE_EVENT,
  SAVE_FILE: SAVE_FILE_EVENT,
} as const;
