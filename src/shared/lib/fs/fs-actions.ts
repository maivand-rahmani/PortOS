import type { AbsolutePath, FileNode, FileSystemNode } from "@/entities/file-system";

import { useOSStore } from "@/processes/os/model/store/store";
import {
  getChildrenModel,
  normalizePath,
  resolveNodeByPath,
} from "@/processes/os/model/file-system";

// ── Path-based Imperative Helpers ───────────────────────
// These mirror os-actions.ts but for file system operations.
// Used by Terminal commands, AI agent, and other non-React contexts.

function getState() {
  return useOSStore.getState();
}

function resolveRootNode(): FileSystemNode | null {
  const state = getState();

  return state.fsNodes.find((node) => node.parentId === null && node.name === "System") ?? null;
}

function resolvePathNode(path: AbsolutePath): FileSystemNode | null {
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return resolveRootNode();
  }

  const state = getState();

  return resolveNodeByPath(
    normalized,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );
}

function splitParentPath(path: AbsolutePath) {
  const normalized = normalizePath(path);
  const parentPath = normalized.slice(0, normalized.lastIndexOf("/")) || "/";
  const name = normalized.slice(normalized.lastIndexOf("/") + 1);

  return {
    parentPath: parentPath as AbsolutePath,
    name,
  };
}

export async function createFileAtPath(
  path: AbsolutePath,
  content?: string,
): Promise<FileNode | null> {
  const { parentPath, name } = splitParentPath(path);
  const parent = resolvePathNode(parentPath);

  if (!parent || parent.type !== "directory") {
    return null;
  }

  return getState().fsCreateFile(parent.id, name, content);
}

export async function readFileAtPath(
  path: AbsolutePath,
): Promise<string | null> {
  const node = resolvePathNode(path);

  if (!node || node.type !== "file") {
    return null;
  }

  return getState().fsReadContent(node.id);
}

export async function writeFileAtPath(
  path: AbsolutePath,
  content: string,
): Promise<boolean> {
  const node = resolvePathNode(path);

  if (!node || node.type !== "file") {
    return false;
  }

  await getState().fsWriteContent(node.id, content);

  return true;
}

export async function deleteAtPath(path: AbsolutePath): Promise<boolean> {
  const node = resolvePathNode(path);

  if (!node) {
    return false;
  }

  await getState().fsDeleteNode(node.id);

  return true;
}

export async function createDirectoryAtPath(
  path: AbsolutePath,
): Promise<FileSystemNode | null> {
  const { parentPath, name } = splitParentPath(path);
  const parent = resolvePathNode(parentPath);

  if (!parent || parent.type !== "directory") {
    return null;
  }

  return getState().fsCreateDirectory(parent.id, name);
}

export function listPath(path: AbsolutePath): FileSystemNode[] {
  const state = getState();
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return state.fsNodes.filter((node) => node.parentId === null);
  }

  const node = resolvePathNode(normalized);

  if (!node || node.type !== "directory") {
    return [];
  }

  return getChildrenModel(state, node.id);
}

export function existsAtPath(path: AbsolutePath): boolean {
  const node = resolvePathNode(path);

  return node !== null;
}

export function getNodeAtPath(path: AbsolutePath): FileSystemNode | null {
  return resolvePathNode(path);
}

export async function moveToPath(
  srcPath: AbsolutePath,
  destPath: AbsolutePath,
): Promise<boolean> {
  const srcNode = resolvePathNode(srcPath);

  if (!srcNode) {
    return false;
  }

  const { parentPath } = splitParentPath(destPath);
  const destParent = resolvePathNode(parentPath);

  if (!destParent || destParent.type !== "directory") {
    return false;
  }

  await getState().fsMoveNode(srcNode.id, destParent.id);

  return true;
}

export async function copyToPath(
  srcPath: AbsolutePath,
  destPath: AbsolutePath,
): Promise<FileSystemNode | null> {
  const srcNode = resolvePathNode(srcPath);

  if (!srcNode) {
    return null;
  }

  const { parentPath } = splitParentPath(destPath);
  const destParent = resolvePathNode(parentPath);

  if (!destParent || destParent.type !== "directory") {
    return null;
  }

  return getState().fsCopyNode(srcNode.id, destParent.id);
}

export async function ensureDirectoryAtPath(
  path: AbsolutePath,
): Promise<FileSystemNode | null> {
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return resolveRootNode();
  }

  const existing = resolvePathNode(normalized);

  if (existing) {
    return existing.type === "directory" ? existing : null;
  }

  const parsed = normalized.split("/").filter(Boolean);
  let currentPath = "/" as AbsolutePath;
  let currentNode = resolveRootNode();

  for (const segment of parsed) {
    currentPath = normalizePath(
      currentPath === "/" ? `/${segment}` : `${currentPath}/${segment}`,
    );

    const existingNode = resolvePathNode(currentPath);

    if (existingNode) {
      if (existingNode.type !== "directory") {
        return null;
      }

      currentNode = existingNode;
      continue;
    }

    if (!currentNode || currentNode.type !== "directory") {
      return null;
    }

    const created = await getState().fsCreateDirectory(currentNode.id, segment);

    if (!created || created.type !== "directory") {
      return null;
    }

    currentNode = created;
  }

  return currentNode;
}

export async function ensureFileAtPath(
  path: AbsolutePath,
  content = "",
): Promise<FileNode | null> {
  const existing = resolvePathNode(path);

  if (existing) {
    return existing.type === "file" ? existing : null;
  }

  const { parentPath, name } = splitParentPath(path);
  const parent = await ensureDirectoryAtPath(parentPath);

  if (!parent || parent.type !== "directory") {
    return null;
  }

  return getState().fsCreateFile(parent.id, name, content);
}

export async function writeFileAtPathOrCreate(
  path: AbsolutePath,
  content: string,
): Promise<FileNode | null> {
  const file = await ensureFileAtPath(path, content);

  if (!file) {
    return null;
  }

  await getState().fsWriteContent(file.id, content);

  return getNodeAtPath(path) as FileNode | null;
}

export async function readJsonAtPath<T>(
  path: AbsolutePath,
): Promise<T | null> {
  const content = await readFileAtPath(path);

  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeJsonAtPath<T>(
  path: AbsolutePath,
  value: T,
): Promise<FileNode | null> {
  return writeFileAtPathOrCreate(path, JSON.stringify(value, null, 2));
}
