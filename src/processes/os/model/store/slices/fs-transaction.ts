/**
 * Atomic file-system transaction helpers.
 *
 * Wraps the common "capture-prev → update-Zustand-optimistically → persist-to-IDB →
 * rollback-on-failure" pattern used by all IDB write methods in file-system.slice.ts.
 *
 * Each method still owns its model logic and dispatch, but this removes the
 * try/catch/rollback/notify boilerplate from 7 write methods.
 */

import type { OSStore } from "../store.types";

/** Subset of OSStore fields that can be rolled back during an FS transaction. */
export type FsTransactionSnapshot = Pick<
  OSStore,
  "fsNodes" | "fsNodeMap" | "fsChildMap" | "fsActiveFileId" | "fsClipboard"
>;

/** Capture the current FS state for potential rollback. */
export function captureFsState(get: () => OSStore): FsTransactionSnapshot {
  return {
    fsNodes: get().fsNodes,
    fsNodeMap: get().fsNodeMap,
    fsChildMap: get().fsChildMap,
    fsActiveFileId: get().fsActiveFileId,
    fsClipboard: get().fsClipboard,
  };
}

/**
 * Execute a persistent operation (IDB write) with automatic rollback on failure.
 *
 * Returns `true` on success, `false` on failure (with Zustand reverted and a
 * system notification fired).
 */
export async function safePersist(
  get: () => OSStore,
  set: (state: Partial<OSStore>) => void,
  prev: FsTransactionSnapshot,
  persistFn: () => Promise<void>,
  errorMessage: string,
): Promise<boolean> {
  try {
    await persistFn();
    return true;
  } catch {
    set(prev);
    get().pushNotification({
      title: "File system",
      body: errorMessage,
      level: "warning" as const,
      appId: "system",
    });
    return false;
  }
}
