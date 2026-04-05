/**
 * Store-aware filesystem path helpers.
 *
 * These functions need to call store actions (fsCreateDirectory, fsCreateFile,
 * fsWriteContent) and read store state. To avoid circular imports, they accept
 * `get: () => OSStore` as a parameter rather than calling `useOSStore.getState()`
 * directly.
 *
 * Pass `get` from the Zustand store factory: `(set, get) => ...`
 */

import type { FileSystemNode } from "@/entities/file-system";
import { normalizePath, resolveNodeByPath } from "../../file-system";
import type { OSStore } from "../store.types";

function resolveFsNodeAtPath(get: () => OSStore, path: string): FileSystemNode | null {
  const state = get();

  return resolveNodeByPath(
    normalizePath(path),
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );
}

function splitAbsolutePath(path: string) {
  const normalized = normalizePath(path);
  const parentPath = normalized.slice(0, normalized.lastIndexOf("/")) || "/";
  const name = normalized.slice(normalized.lastIndexOf("/") + 1);

  return {
    normalized,
    parentPath,
    name,
  };
}

export async function ensureFsDirectoryAtPath(
  get: () => OSStore,
  path: string,
): Promise<FileSystemNode | null> {
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return null;
  }

  const segments = normalized.split("/").filter(Boolean);
  let current: FileSystemNode | null = null;
  let currentPath = "";

  for (let index = 0; index < segments.length; index += 1) {
    currentPath = `${currentPath}/${segments[index]}`;

    const existing = resolveFsNodeAtPath(get, currentPath);

    if (existing) {
      if (existing.type !== "directory") {
        return null;
      }

      current = existing;
      continue;
    }

    if (!current || current.type !== "directory") {
      return null;
    }

    const created = await get().fsCreateDirectory(current.id, segments[index]);

    if (!created || created.type !== "directory") {
      return null;
    }

    current = created;
  }

  return current;
}

export async function writeFsFileAtPath(
  get: () => OSStore,
  path: string,
  content: string,
): Promise<void> {
  const existing = resolveFsNodeAtPath(get, path);

  if (existing) {
    if (existing.type !== "file") {
      return;
    }

    await get().fsWriteContent(existing.id, content);
    return;
  }

  const { parentPath, name } = splitAbsolutePath(path);
  const parent = await ensureFsDirectoryAtPath(get, parentPath);

  if (!parent || parent.type !== "directory") {
    return;
  }

  await get().fsCreateFile(parent.id, name, content);
}

export async function writeFsJsonAtPath(
  get: () => OSStore,
  path: string,
  value: unknown,
): Promise<void> {
  await writeFsFileAtPath(get, path, JSON.stringify(value, null, 2));
}
