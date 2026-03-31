// ── File System OS Events ───────────────────────────────
// Inter-app communication for file operations.
// Follows the same dispatch/consume pattern as other OS events.

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

  localStorage.setItem(OPEN_FILE_KEY, JSON.stringify(detail));
  window.dispatchEvent(new CustomEvent(OPEN_FILE_EVENT, { detail }));
}

export function consumeOpenFileRequest(
  targetWindowId?: string,
): OpenFileRequest | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(OPEN_FILE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as OpenFileRequest;

    if (targetWindowId && parsed.targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    localStorage.removeItem(OPEN_FILE_KEY);

    return parsed;
  } catch {
    localStorage.removeItem(OPEN_FILE_KEY);

    return null;
  }
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

  localStorage.setItem(SAVE_FILE_KEY, JSON.stringify(detail));
  window.dispatchEvent(new CustomEvent(SAVE_FILE_EVENT, { detail }));
}

export function consumeSaveFileRequest(
  targetWindowId?: string,
): SaveFileRequest | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(SAVE_FILE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SaveFileRequest;

    if (targetWindowId && parsed.targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    localStorage.removeItem(SAVE_FILE_KEY);

    return parsed;
  } catch {
    localStorage.removeItem(SAVE_FILE_KEY);

    return null;
  }
}

// ── Event Name Constants ────────────────────────────────

export const FS_EVENTS = {
  OPEN_FILE: OPEN_FILE_EVENT,
  SAVE_FILE: SAVE_FILE_EVENT,
} as const;
