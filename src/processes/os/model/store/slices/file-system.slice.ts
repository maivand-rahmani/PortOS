import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import * as idb from "@/shared/lib/fs/idb-storage";
import { dispatchFileSystemChange } from "@/shared/lib/fs/fs-events";
import {
  beginFileDragModel,
  endFileDragModel,
  fileDragManagerInitialState,
  setFileDropTargetModel,
  updateFileDragModel,
} from "../../file-drag-manager";
import {
  createFileSystemManagerModel,
  getNodePath,
  hydrateFileSystemModel,
  createFileModel,
  createDirectoryModel,
  normalizePath,
  deleteNodeModel,
  renameNodeModel,
  moveNodeModel,
  copyNodeModel,
  resolveNodeByPath,
  updateFileMetadataModel,
  setCutModel,
  setCopyModel,
  clearClipboardModel,
  searchNodesModel,
  setSearchQueryModel,
  setSearchResultsModel,
  clearSearchModel,
} from "../../file-system";

export type FileSystemSlice = Pick<
  OSStore,
  | "fsNodes"
  | "fsNodeMap"
  | "fsChildMap"
  | "fsHydrated"
  | "fsActiveFileId"
  | "fsClipboard"
  | "fsSearchQuery"
  | "fsSearchResults"
  | "fileDragState"
  | "fileDropTarget"
  | "hydrateFileSystem"
  | "fsCreateFile"
  | "fsCreateDirectory"
  | "fsReadContent"
  | "fsWriteContent"
  | "fsDeleteNode"
  | "fsRenameNode"
  | "fsMoveNode"
  | "fsCopyNode"
  | "fsSearch"
  | "fsClearSearch"
  | "fsCut"
  | "fsCopy"
  | "fsPaste"
  | "fsClearClipboard"
  | "fsSetActiveFile"
  | "beginFileDrag"
  | "updateFileDrag"
  | "setFileDropTarget"
  | "endFileDrag"
>;

export const createFileSystemSlice: StateCreator<OSStore, [], [], FileSystemSlice> = (set, get) => ({
  ...createFileSystemManagerModel(),
  ...fileDragManagerInitialState,

  hydrateFileSystem: async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const nodes = await idb.seedDefaultFileSystem();
      const nextState = hydrateFileSystemModel(get(), nodes);

      set({
        fsNodes: nextState.fsNodes,
        fsNodeMap: nextState.fsNodeMap,
        fsChildMap: nextState.fsChildMap,
        fsHydrated: nextState.fsHydrated,
      });
    } catch {
      const nextState = hydrateFileSystemModel(get(), []);
      nextState.fsHydrated = true;

      set({
        fsNodes: nextState.fsNodes,
        fsNodeMap: nextState.fsNodeMap,
        fsChildMap: nextState.fsChildMap,
        fsHydrated: true,
      });
    }
  },

  fsCreateFile: async (parentId, name, content) => {
    const prev = { fsNodes: get().fsNodes, fsNodeMap: get().fsNodeMap, fsChildMap: get().fsChildMap };
    const result = createFileModel(get(), { parentId, name, content });

    set({
      fsNodes: result.state.fsNodes,
      fsNodeMap: result.state.fsNodeMap,
      fsChildMap: result.state.fsChildMap,
    });

    try {
      await idb.putNode(result.node);

      if (content) {
        await idb.putContent({
          nodeId: result.node.id,
          data: content,
          encoding: "utf-8",
          checksum: idb.computeChecksum(content),
        });
      }
    } catch {
      set(prev);
      get().pushNotification({ title: "File system", body: "Failed to save file.", level: "warning", appId: "system" });
      return null;
    }

    dispatchFileSystemChange({
      type: "file-created",
      nodeId: result.node.id,
      nodeType: result.node.type,
      path: getNodePath(result.node.id, result.state.fsNodeMap),
    });

    return result.node;
  },

  fsCreateDirectory: async (parentId, name) => {
    const prev = { fsNodes: get().fsNodes, fsNodeMap: get().fsNodeMap, fsChildMap: get().fsChildMap };
    const result = createDirectoryModel(get(), { parentId, name });

    set({
      fsNodes: result.state.fsNodes,
      fsNodeMap: result.state.fsNodeMap,
      fsChildMap: result.state.fsChildMap,
    });

    try {
      await idb.putNode(result.node);
    } catch {
      set(prev);
      get().pushNotification({ title: "File system", body: "Failed to create directory.", level: "warning", appId: "system" });
      return null;
    }

    dispatchFileSystemChange({
      type: "directory-created",
      nodeId: result.node.id,
      nodeType: result.node.type,
      path: getNodePath(result.node.id, result.state.fsNodeMap),
    });

    return result.node;
  },

  fsReadContent: async (nodeId) => {
    const content = await idb.getContent(nodeId);

    return content?.data ?? null;
  },

  fsWriteContent: async (nodeId, content) => {
    const prev = { fsNodes: get().fsNodes, fsNodeMap: get().fsNodeMap, fsChildMap: get().fsChildMap };
    const previousNode = get().fsNodeMap[nodeId];
    const size = new Blob([content]).size;
    const nextState = updateFileMetadataModel(get(), nodeId, { size });

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
    });

    try {
      const updatedNode = nextState.fsNodeMap[nodeId];

      if (updatedNode) {
        await idb.putNode(updatedNode);
      }

      await idb.putContent({
        nodeId,
        data: content,
        encoding: "utf-8",
        checksum: idb.computeChecksum(content),
      });
    } catch {
      set(prev);
      get().pushNotification({ title: "File system", body: "Failed to save file content.", level: "warning", appId: "system" });
      return;
    }

    if (previousNode?.type === "file") {
      dispatchFileSystemChange({
        type: "file-written",
        nodeId,
        nodeType: previousNode.type,
        path: getNodePath(nodeId, nextState.fsNodeMap),
      });
    }
  },

  fsDeleteNode: async (nodeId) => {
    const prev = { fsNodes: get().fsNodes, fsNodeMap: get().fsNodeMap, fsChildMap: get().fsChildMap, fsActiveFileId: get().fsActiveFileId, fsClipboard: get().fsClipboard };
    const previousNode = get().fsNodeMap[nodeId];
    const previousPath = previousNode
      ? getNodePath(nodeId, get().fsNodeMap)
      : undefined;
    const result = deleteNodeModel(get(), nodeId);

    set({
      fsNodes: result.state.fsNodes,
      fsNodeMap: result.state.fsNodeMap,
      fsChildMap: result.state.fsChildMap,
      fsActiveFileId: result.state.fsActiveFileId,
      fsClipboard: result.state.fsClipboard,
    });

    try {
      await idb.deleteNodes(result.deletedIds);
      await idb.deleteContents(result.deletedIds);
    } catch {
      set(prev);
      get().pushNotification({ title: "File system", body: "Failed to delete node.", level: "warning", appId: "system" });
      return;
    }

    if (previousNode) {
      dispatchFileSystemChange({
        type: "node-deleted",
        nodeId,
        nodeType: previousNode.type,
        previousPath,
      });
    }
  },

  fsRenameNode: async (nodeId, newName) => {
    const prev = { fsNodes: get().fsNodes, fsNodeMap: get().fsNodeMap, fsChildMap: get().fsChildMap };
    const previousNode = get().fsNodeMap[nodeId];
    const previousPath = previousNode
      ? getNodePath(nodeId, get().fsNodeMap)
      : undefined;
    const nextState = renameNodeModel(get(), nodeId, newName);

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
    });

    const updatedNode = nextState.fsNodeMap[nodeId];

    if (updatedNode) {
      try {
        await idb.putNode(updatedNode);
      } catch {
        set(prev);
        get().pushNotification({ title: "File system", body: "Failed to rename node.", level: "warning", appId: "system" });
        return;
      }

      dispatchFileSystemChange({
        type: "node-renamed",
        nodeId,
        nodeType: updatedNode.type,
        path: getNodePath(nodeId, nextState.fsNodeMap),
        previousPath,
      });
    }
  },

  fsMoveNode: async (nodeId, newParentId) => {
    const prev = { fsNodes: get().fsNodes, fsNodeMap: get().fsNodeMap, fsChildMap: get().fsChildMap };
    const previousNode = get().fsNodeMap[nodeId];
    const previousPath = previousNode
      ? getNodePath(nodeId, get().fsNodeMap)
      : undefined;
    const nextState = moveNodeModel(get(), nodeId, newParentId);

    set({
      fsNodes: nextState.fsNodes,
      fsNodeMap: nextState.fsNodeMap,
      fsChildMap: nextState.fsChildMap,
    });

    const updatedNode = nextState.fsNodeMap[nodeId];

    if (updatedNode) {
      try {
        await idb.putNode(updatedNode);
      } catch {
        set(prev);
        get().pushNotification({ title: "File system", body: "Failed to move node.", level: "warning", appId: "system" });
        return;
      }

      dispatchFileSystemChange({
        type: "node-moved",
        nodeId,
        nodeType: updatedNode.type,
        path: getNodePath(nodeId, nextState.fsNodeMap),
        previousPath,
      });
    }
  },

  fsCopyNode: async (nodeId, newParentId) => {
    const prev = { fsNodes: get().fsNodes, fsNodeMap: get().fsNodeMap, fsChildMap: get().fsChildMap };
    const result = copyNodeModel(get(), nodeId, newParentId);

    if (!result.newNode) {
      return null;
    }

    set({
      fsNodes: result.state.fsNodes,
      fsNodeMap: result.state.fsNodeMap,
      fsChildMap: result.state.fsChildMap,
    });

    try {
      await idb.putNode(result.newNode);

      if (result.newNode.type === "file") {
        const sourceContent = await idb.getContent(nodeId);

        if (sourceContent) {
          await idb.putContent({
            nodeId: result.newNode.id,
            data: sourceContent.data,
            encoding: sourceContent.encoding,
            checksum: sourceContent.checksum,
          });
        }
      }
    } catch {
      set(prev);
      get().pushNotification({ title: "File system", body: "Failed to copy node.", level: "warning", appId: "system" });
      return null;
    }

    return result.newNode;
  },

  fsSearch: (query) => {
    const nextState = setSearchQueryModel(get(), query);
    const results = searchNodesModel(nextState, query);
    const withResults = setSearchResultsModel(nextState, results);

    set({
      fsSearchQuery: withResults.fsSearchQuery,
      fsSearchResults: withResults.fsSearchResults,
    });
  },

  fsClearSearch: () => {
    const nextState = clearSearchModel(get());

    set({
      fsSearchQuery: nextState.fsSearchQuery,
      fsSearchResults: nextState.fsSearchResults,
    });
  },

  fsCut: (nodeIds) => {
    const nextState = setCutModel(get(), nodeIds);

    set({ fsClipboard: nextState.fsClipboard });
  },

  fsCopy: (nodeIds) => {
    const nextState = setCopyModel(get(), nodeIds);

    set({ fsClipboard: nextState.fsClipboard });
  },

  fsPaste: async (targetParentId) => {
    const clipboard = get().fsClipboard;

    if (!clipboard || clipboard.nodeIds.length === 0) {
      return;
    }

    if (clipboard.operation === "copy") {
      for (const nodeId of clipboard.nodeIds) {
        await get().fsCopyNode(nodeId, targetParentId);
      }
    } else {
      for (const nodeId of clipboard.nodeIds) {
        await get().fsMoveNode(nodeId, targetParentId);
      }

      set({ fsClipboard: null });
    }
  },

  fsClearClipboard: () => {
    const nextState = clearClipboardModel(get());

    set({ fsClipboard: nextState.fsClipboard });
  },

  fsSetActiveFile: (nodeId) => {
    set({ fsActiveFileId: nodeId });
  },

  beginFileDrag: (nodeId, pointer) => {
    const next = beginFileDragModel(get(), { nodeId, pointer });

    set({
      fileDragState: next.fileDragState,
      fileDropTarget: next.fileDropTarget,
    });
  },

  updateFileDrag: (pointer) => {
    const next = updateFileDragModel(get(), pointer);

    set({ fileDragState: next.fileDragState });
  },

  setFileDropTarget: (target) => {
    const next = setFileDropTargetModel(get(), target);

    set({ fileDropTarget: next.fileDropTarget });
  },

  endFileDrag: () => {
    const next = endFileDragModel();

    set({
      fileDragState: next.fileDragState,
      fileDropTarget: next.fileDropTarget,
    });
  },
});
