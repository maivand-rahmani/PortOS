import type {
  DirectoryNode,
  FileNode,
  FileSystemNode,
  FileSystemNodeMap,
  FileSystemChildMap,
} from "@/entities/file-system";
import { getExtension, getMimeType } from "@/entities/file-system";

import type { FileSystemManagerState } from "./file-system.types";
import { getDescendantIds, resolveUniqueName } from "./file-system.path";

// ── Index Builders ──────────────────────────────────────

export function buildNodeMap(nodes: FileSystemNode[]): FileSystemNodeMap {
  const map: FileSystemNodeMap = {};

  for (const node of nodes) {
    map[node.id] = node;
  }

  return map;
}

export function buildChildMap(nodes: FileSystemNode[]): FileSystemChildMap {
  const map: FileSystemChildMap = {};

  for (const node of nodes) {
    const parentId = node.parentId ?? "__root__";

    if (!map[parentId]) {
      map[parentId] = [];
    }

    map[parentId].push(node.id);
  }

  return map;
}

function rebuildIndexes(
  nodes: FileSystemNode[],
): Pick<FileSystemManagerState, "fsNodes" | "fsNodeMap" | "fsChildMap"> {
  return {
    fsNodes: nodes,
    fsNodeMap: buildNodeMap(nodes),
    fsChildMap: buildChildMap(nodes),
  };
}

// ── Hydrate ─────────────────────────────────────────────

export function hydrateFileSystemModel(
  state: FileSystemManagerState,
  nodes: FileSystemNode[],
): FileSystemManagerState {
  return {
    ...state,
    ...rebuildIndexes(nodes),
    fsHydrated: true,
  };
}

// ── Create File ─────────────────────────────────────────

export function createFileModel(
  state: FileSystemManagerState,
  input: {
    parentId: string;
    name: string;
    content?: string;
  },
): { state: FileSystemManagerState; node: FileNode } {
  const extension = getExtension(input.name);
  const mimeType = getMimeType(extension);
  const now = new Date().toISOString();

  const resolvedName = resolveUniqueName(
    input.name,
    input.parentId,
    state.fsNodeMap,
    state.fsChildMap,
  );

  const node: FileNode = {
    id: crypto.randomUUID(),
    name: resolvedName,
    type: "file",
    parentId: input.parentId,
    createdAt: now,
    updatedAt: now,
    isHidden: resolvedName.startsWith("."),
    extension,
    mimeType,
    size: input.content ? new Blob([input.content]).size : 0,
    version: 1,
  };

  const nextNodes = [...state.fsNodes, node];

  return {
    state: {
      ...state,
      ...rebuildIndexes(nextNodes),
    },
    node,
  };
}

// ── Create Directory ────────────────────────────────────

export function createDirectoryModel(
  state: FileSystemManagerState,
  input: {
    parentId: string | null;
    name: string;
  },
): { state: FileSystemManagerState; node: DirectoryNode } {
  const now = new Date().toISOString();

  const resolvedName =
    input.parentId !== null
      ? resolveUniqueName(
          input.name,
          input.parentId,
          state.fsNodeMap,
          state.fsChildMap,
        )
      : input.name;

  const node: DirectoryNode = {
    id: crypto.randomUUID(),
    name: resolvedName,
    type: "directory",
    parentId: input.parentId,
    createdAt: now,
    updatedAt: now,
    isHidden: resolvedName.startsWith("."),
  };

  const nextNodes = [...state.fsNodes, node];

  return {
    state: {
      ...state,
      ...rebuildIndexes(nextNodes),
    },
    node,
  };
}

// ── Delete Node (recursive) ─────────────────────────────

export function deleteNodeModel(
  state: FileSystemManagerState,
  nodeId: string,
): { state: FileSystemManagerState; deletedIds: string[] } {
  const descendantIds = getDescendantIds(nodeId, state.fsChildMap);
  const allDeletedIds = [nodeId, ...descendantIds];
  const deleteSet = new Set(allDeletedIds);

  const nextNodes = state.fsNodes.filter((n) => !deleteSet.has(n.id));

  return {
    state: {
      ...state,
      ...rebuildIndexes(nextNodes),
      fsActiveFileId:
        state.fsActiveFileId && deleteSet.has(state.fsActiveFileId)
          ? null
          : state.fsActiveFileId,
      fsClipboard: state.fsClipboard
        ? {
            ...state.fsClipboard,
            nodeIds: state.fsClipboard.nodeIds.filter(
              (id) => !deleteSet.has(id),
            ),
          }
        : null,
    },
    deletedIds: allDeletedIds,
  };
}

// ── Rename Node ─────────────────────────────────────────

export function renameNodeModel(
  state: FileSystemManagerState,
  nodeId: string,
  newName: string,
): FileSystemManagerState {
  const node = state.fsNodeMap[nodeId];

  if (!node) {
    return state;
  }

  const now = new Date().toISOString();
  const resolvedName = resolveUniqueName(
    newName,
    node.parentId,
    state.fsNodeMap,
    state.fsChildMap,
    nodeId,
  );

  const updatedNode: FileSystemNode =
    node.type === "file"
      ? {
          ...node,
          name: resolvedName,
          extension: getExtension(resolvedName),
          mimeType: getMimeType(getExtension(resolvedName)),
          updatedAt: now,
        }
      : {
          ...node,
          name: resolvedName,
          updatedAt: now,
        };

  const nextNodes = state.fsNodes.map((n) =>
    n.id === nodeId ? updatedNode : n,
  );

  return {
    ...state,
    ...rebuildIndexes(nextNodes),
  };
}

// ── Move Node ───────────────────────────────────────────

export function moveNodeModel(
  state: FileSystemManagerState,
  nodeId: string,
  newParentId: string,
): FileSystemManagerState {
  const node = state.fsNodeMap[nodeId];

  if (!node) {
    return state;
  }

  if (node.parentId === newParentId) {
    return state;
  }

  // Prevent moving a directory into its own descendant
  if (node.type === "directory") {
    const descendantIds = getDescendantIds(nodeId, state.fsChildMap);

    if (descendantIds.includes(newParentId)) {
      return state;
    }
  }

  const now = new Date().toISOString();
  const resolvedName = resolveUniqueName(
    node.name,
    newParentId,
    state.fsNodeMap,
    state.fsChildMap,
    nodeId,
  );

  const updatedNode: FileSystemNode = {
    ...node,
    parentId: newParentId,
    name: resolvedName,
    updatedAt: now,
  };

  const nextNodes = state.fsNodes.map((n) =>
    n.id === nodeId ? updatedNode : n,
  );

  return {
    ...state,
    ...rebuildIndexes(nextNodes),
  };
}

// ── Copy Node (shallow — files only for now) ────────────

export function copyNodeModel(
  state: FileSystemManagerState,
  nodeId: string,
  newParentId: string,
): { state: FileSystemManagerState; newNode: FileSystemNode | null } {
  const source = state.fsNodeMap[nodeId];

  if (!source) {
    return { state, newNode: null };
  }

  const now = new Date().toISOString();
  const resolvedName = resolveUniqueName(
    source.name,
    newParentId,
    state.fsNodeMap,
    state.fsChildMap,
  );

  const newNode: FileSystemNode =
    source.type === "file"
      ? {
          ...source,
          id: crypto.randomUUID(),
          parentId: newParentId,
          name: resolvedName,
          createdAt: now,
          updatedAt: now,
          version: 1,
        }
      : {
          ...source,
          id: crypto.randomUUID(),
          parentId: newParentId,
          name: resolvedName,
          createdAt: now,
          updatedAt: now,
        };

  const nextNodes = [...state.fsNodes, newNode];

  return {
    state: {
      ...state,
      ...rebuildIndexes(nextNodes),
    },
    newNode,
  };
}

// ── Update File Metadata (after content write) ──────────

export function updateFileMetadataModel(
  state: FileSystemManagerState,
  nodeId: string,
  input: {
    size: number;
  },
): FileSystemManagerState {
  const node = state.fsNodeMap[nodeId];

  if (!node || node.type !== "file") {
    return state;
  }

  const now = new Date().toISOString();
  const updatedNode: FileNode = {
    ...node,
    size: input.size,
    version: node.version + 1,
    updatedAt: now,
  };

  const nextNodes = state.fsNodes.map((n) =>
    n.id === nodeId ? updatedNode : n,
  );

  return {
    ...state,
    ...rebuildIndexes(nextNodes),
  };
}

// ── Clipboard Operations ────────────────────────────────

export function setCutModel(
  state: FileSystemManagerState,
  nodeIds: string[],
): FileSystemManagerState {
  return {
    ...state,
    fsClipboard: { nodeIds, operation: "cut" },
  };
}

export function setCopyModel(
  state: FileSystemManagerState,
  nodeIds: string[],
): FileSystemManagerState {
  return {
    ...state,
    fsClipboard: { nodeIds, operation: "copy" },
  };
}

export function clearClipboardModel(
  state: FileSystemManagerState,
): FileSystemManagerState {
  return {
    ...state,
    fsClipboard: null,
  };
}

// ── Get Children ────────────────────────────────────────

export function getChildrenModel(
  state: FileSystemManagerState,
  parentId: string,
): FileSystemNode[] {
  const childIds = state.fsChildMap[parentId] ?? [];

  return childIds
    .map((id) => state.fsNodeMap[id])
    .filter((n): n is FileSystemNode => n !== undefined);
}

// ── Get Root Nodes ──────────────────────────────────────

export function getRootNodesModel(
  state: FileSystemManagerState,
): FileSystemNode[] {
  return state.fsNodes.filter((n) => n.parentId === null);
}
