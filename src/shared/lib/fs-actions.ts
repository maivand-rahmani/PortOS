import type { AbsolutePath, FileNode, FileSystemNode } from "@/entities/file-system";

import { useOSStore } from "@/processes/os/model/store";
import { resolveNodeByPath, getChildrenModel } from "@/processes/os/model/file-system";

// ── Path-based Imperative Helpers ───────────────────────
// These mirror os-actions.ts but for file system operations.
// Used by Terminal commands, AI agent, and other non-React contexts.

function getState() {
  return useOSStore.getState();
}

export async function createFileAtPath(
  path: AbsolutePath,
  content?: string,
): Promise<FileNode | null> {
  const state = getState();
  const parentPath = path.slice(0, path.lastIndexOf("/")) || "/";
  const name = path.slice(path.lastIndexOf("/") + 1);

  const parent = resolveNodeByPath(
    parentPath as AbsolutePath,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!parent || parent.type !== "directory") {
    return null;
  }

  return getState().fsCreateFile(parent.id, name, content);
}

export async function readFileAtPath(
  path: AbsolutePath,
): Promise<string | null> {
  const state = getState();
  const node = resolveNodeByPath(
    path,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!node || node.type !== "file") {
    return null;
  }

  return getState().fsReadContent(node.id);
}

export async function writeFileAtPath(
  path: AbsolutePath,
  content: string,
): Promise<boolean> {
  const state = getState();
  const node = resolveNodeByPath(
    path,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!node || node.type !== "file") {
    return false;
  }

  await getState().fsWriteContent(node.id, content);

  return true;
}

export async function deleteAtPath(path: AbsolutePath): Promise<boolean> {
  const state = getState();
  const node = resolveNodeByPath(
    path,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!node) {
    return false;
  }

  await getState().fsDeleteNode(node.id);

  return true;
}

export async function createDirectoryAtPath(
  path: AbsolutePath,
): Promise<FileSystemNode | null> {
  const state = getState();
  const parentPath = path.slice(0, path.lastIndexOf("/")) || "/";
  const name = path.slice(path.lastIndexOf("/") + 1);

  const parent = resolveNodeByPath(
    parentPath as AbsolutePath,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!parent || parent.type !== "directory") {
    return null;
  }

  return getState().fsCreateDirectory(parent.id, name);
}

export function listPath(path: AbsolutePath): FileSystemNode[] {
  const state = getState();
  const node = resolveNodeByPath(
    path,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!node || node.type !== "directory") {
    return [];
  }

  return getChildrenModel(state, node.id);
}

export function existsAtPath(path: AbsolutePath): boolean {
  const state = getState();
  const node = resolveNodeByPath(
    path,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  return node !== null;
}

export function getNodeAtPath(path: AbsolutePath): FileSystemNode | null {
  const state = getState();

  return resolveNodeByPath(
    path,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );
}

export async function moveToPath(
  srcPath: AbsolutePath,
  destPath: AbsolutePath,
): Promise<boolean> {
  const state = getState();
  const srcNode = resolveNodeByPath(
    srcPath,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!srcNode) {
    return false;
  }

  const destParentPath =
    destPath.slice(0, destPath.lastIndexOf("/")) || "/";
  const destParent = resolveNodeByPath(
    destParentPath as AbsolutePath,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

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
  const state = getState();
  const srcNode = resolveNodeByPath(
    srcPath,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!srcNode) {
    return null;
  }

  const destParentPath =
    destPath.slice(0, destPath.lastIndexOf("/")) || "/";
  const destParent = resolveNodeByPath(
    destParentPath as AbsolutePath,
    state.fsNodes,
    state.fsNodeMap,
    state.fsChildMap,
  );

  if (!destParent || destParent.type !== "directory") {
    return null;
  }

  return getState().fsCopyNode(srcNode.id, destParent.id);
}
