"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useOSStore } from "@/processes";
import type {
  AbsolutePath,
  FileSystemNode,
} from "@/entities/file-system";
import { isTextMime } from "@/entities/file-system";
import {
  getNodePath,
  getAncestors,
  getChildrenModel,
  getRootNodesModel,
} from "@/processes/os/model/file-system";
import { openEditorWithFile } from "@/shared/lib/os-actions";

// ── Types ───────────────────────────────────────────────

export type FilesViewMode = "grid" | "list";
export type FilesSortKey = "name" | "updated" | "size" | "type";
export type FilesSortDirection = "asc" | "desc";

export type FilesSortConfig = {
  key: FilesSortKey;
  direction: FilesSortDirection;
};

export type FilesAppState = {
  currentDirId: string | null;
  currentPath: AbsolutePath;
  viewMode: FilesViewMode;
  sortConfig: FilesSortConfig;
  selectedNodeIds: Set<string>;
  renamingNodeId: string | null;
  renameValue: string;
  searchQuery: string;
  isSearching: boolean;
  previewNodeId: string | null;
  showHidden: boolean;
  contextMenu: {
    x: number;
    y: number;
    nodeId: string | null;
  } | null;
};

// ── Sorting ─────────────────────────────────────────────

function sortNodes(
  nodes: FileSystemNode[],
  config: FilesSortConfig,
): FileSystemNode[] {
  const dirs = nodes.filter((n) => n.type === "directory");
  const files = nodes.filter((n) => n.type === "file");

  const compare = (a: FileSystemNode, b: FileSystemNode): number => {
    let result = 0;

    switch (config.key) {
      case "name":
        result = a.name.localeCompare(b.name);
        break;
      case "updated":
        result = a.updatedAt.localeCompare(b.updatedAt);
        break;
      case "size":
        result =
          (a.type === "file" ? a.size : 0) -
          (b.type === "file" ? b.size : 0);
        break;
      case "type":
        result =
          (a.type === "file" ? a.extension : "").localeCompare(
            b.type === "file" ? b.extension : "",
          );
        break;
    }

    return config.direction === "asc" ? result : -result;
  };

  return [...dirs.sort(compare), ...files.sort(compare)];
}

// ── Hook ────────────────────────────────────────────────

const ROOT_DIR_IDS = [
  "dir-desktop",
  "dir-documents",
  "dir-downloads",
  "dir-system",
  "dir-templates",
];

export function useFilesApp() {
  const fsNodes = useOSStore((s) => s.fsNodes);
  const fsNodeMap = useOSStore((s) => s.fsNodeMap);
  const fsChildMap = useOSStore((s) => s.fsChildMap);
  const fsHydrated = useOSStore((s) => s.fsHydrated);
  const fsClipboard = useOSStore((s) => s.fsClipboard);
  const fsSearchResults = useOSStore((s) => s.fsSearchResults);

  const fsCreateFile = useOSStore((s) => s.fsCreateFile);
  const fsCreateDirectory = useOSStore((s) => s.fsCreateDirectory);
  const fsReadContent = useOSStore((s) => s.fsReadContent);
  const fsDeleteNode = useOSStore((s) => s.fsDeleteNode);
  const fsRenameNode = useOSStore((s) => s.fsRenameNode);
  const fsMoveNode = useOSStore((s) => s.fsMoveNode);
  const fsSearch = useOSStore((s) => s.fsSearch);
  const fsClearSearch = useOSStore((s) => s.fsClearSearch);
  const fsCut = useOSStore((s) => s.fsCut);
  const fsCopy = useOSStore((s) => s.fsCopy);
  const fsPaste = useOSStore((s) => s.fsPaste);

  const [state, setState] = useState<FilesAppState>({
    currentDirId: null,
    currentPath: "/",
    viewMode: "grid",
    sortConfig: { key: "name", direction: "asc" },
    selectedNodeIds: new Set(),
    renamingNodeId: null,
    renameValue: "",
    searchQuery: "",
    isSearching: false,
    previewNodeId: null,
    showHidden: false,
    contextMenu: null,
  });

  // Navigate to root on hydrate
  useEffect(() => {
    if (fsHydrated && state.currentDirId === null) {
      setState((prev) => ({ ...prev, currentDirId: null, currentPath: "/" }));
    }
  }, [fsHydrated, state.currentDirId]);

  // ── Computed values ─────────────────────────────────

  const currentChildren = useMemo(() => {
    if (!fsHydrated) {
      return [];
    }

    if (state.currentDirId === null) {
      // Show root directories
      return getRootNodesModel({ fsNodes, fsNodeMap, fsChildMap } as Parameters<typeof getRootNodesModel>[0]);
    }

    return getChildrenModel(
      { fsNodes, fsNodeMap, fsChildMap } as Parameters<typeof getChildrenModel>[0],
      state.currentDirId,
    );
  }, [fsHydrated, fsNodes, fsNodeMap, fsChildMap, state.currentDirId]);

  const visibleChildren = useMemo(() => {
    let filtered = currentChildren;

    if (!state.showHidden) {
      filtered = filtered.filter((n) => !n.isHidden);
    }

    return sortNodes(filtered, state.sortConfig);
  }, [currentChildren, state.showHidden, state.sortConfig]);

  const breadcrumbTrail = useMemo(() => {
    if (!state.currentDirId || !fsNodeMap[state.currentDirId]) {
      return [];
    }

    const ancestors = getAncestors(state.currentDirId, fsNodeMap);
    const current = fsNodeMap[state.currentDirId];

    return [...ancestors, current];
  }, [state.currentDirId, fsNodeMap]);

  const sidebarRoots = useMemo(() => {
    if (!fsHydrated) {
      return [];
    }

    return ROOT_DIR_IDS
      .map((id) => fsNodeMap[id])
      .filter((n): n is FileSystemNode => n !== undefined);
  }, [fsHydrated, fsNodeMap]);

  const previewNode = useMemo(() => {
    if (!state.previewNodeId) {
      return null;
    }

    return fsNodeMap[state.previewNodeId] ?? null;
  }, [state.previewNodeId, fsNodeMap]);

  // ── Navigation ──────────────────────────────────────

  const navigateTo = useCallback(
    (nodeId: string | null) => {
      if (nodeId === null) {
        setState((prev) => ({
          ...prev,
          currentDirId: null,
          currentPath: "/",
          selectedNodeIds: new Set(),
          renamingNodeId: null,
          previewNodeId: null,
          contextMenu: null,
        }));

        return;
      }

      const node = fsNodeMap[nodeId];

      if (!node || node.type !== "directory") {
        return;
      }

      const path = getNodePath(nodeId, fsNodeMap);

      setState((prev) => ({
        ...prev,
        currentDirId: nodeId,
        currentPath: path,
        selectedNodeIds: new Set(),
        renamingNodeId: null,
        previewNodeId: null,
        contextMenu: null,
      }));
    },
    [fsNodeMap],
  );

  const navigateUp = useCallback(() => {
    if (state.currentDirId === null) {
      return;
    }

    const current = fsNodeMap[state.currentDirId];

    if (!current) {
      return;
    }

    navigateTo(current.parentId);
  }, [state.currentDirId, fsNodeMap, navigateTo]);

  const openNode = useCallback(
    (nodeId: string) => {
      const node = fsNodeMap[nodeId];

      if (!node) {
        return;
      }

      if (node.type === "directory") {
        navigateTo(nodeId);
      } else if (node.type === "file" && isTextMime(node.mimeType)) {
        // Open editable text files in the Editor app
        const path = getNodePath(nodeId, fsNodeMap);

        openEditorWithFile({
          nodeId,
          path,
          mode: "edit",
          source: "files",
        });
      } else {
        // Non-text files open in the inline preview panel
        setState((prev) => ({ ...prev, previewNodeId: nodeId }));
      }
    },
    [fsNodeMap, navigateTo],
  );

  // ── Selection ───────────────────────────────────────

  const selectNode = useCallback(
    (nodeId: string, additive = false) => {
      setState((prev) => {
        const next = new Set(additive ? prev.selectedNodeIds : []);

        if (next.has(nodeId) && additive) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }

        return { ...prev, selectedNodeIds: next, contextMenu: null };
      });
    },
    [],
  );

  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedNodeIds: new Set(visibleChildren.map((n) => n.id)),
    }));
  }, [visibleChildren]);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedNodeIds: new Set(),
      contextMenu: null,
    }));
  }, []);

  // ── CRUD Operations ─────────────────────────────────

  const createNewFile = useCallback(async () => {
    const parentId = state.currentDirId;

    if (!parentId) {
      return;
    }

    const node = await fsCreateFile(parentId, "untitled.txt", "");

    if (node) {
      setState((prev) => ({
        ...prev,
        renamingNodeId: node.id,
        renameValue: node.name,
        selectedNodeIds: new Set([node.id]),
      }));
    }
  }, [state.currentDirId, fsCreateFile]);

  const createNewFolder = useCallback(async () => {
    const parentId = state.currentDirId;

    if (!parentId) {
      return;
    }

    const node = await fsCreateDirectory(parentId, "New Folder");

    if (node) {
      setState((prev) => ({
        ...prev,
        renamingNodeId: node.id,
        renameValue: node.name,
        selectedNodeIds: new Set([node.id]),
      }));
    }
  }, [state.currentDirId, fsCreateDirectory]);

  const deleteSelected = useCallback(async () => {
    const ids = Array.from(state.selectedNodeIds);

    for (const id of ids) {
      await fsDeleteNode(id);
    }

    setState((prev) => ({
      ...prev,
      selectedNodeIds: new Set(),
      previewNodeId:
        prev.previewNodeId && ids.includes(prev.previewNodeId)
          ? null
          : prev.previewNodeId,
    }));
  }, [state.selectedNodeIds, fsDeleteNode]);

  const startRename = useCallback(
    (nodeId: string) => {
      const node = fsNodeMap[nodeId];

      if (!node) {
        return;
      }

      setState((prev) => ({
        ...prev,
        renamingNodeId: nodeId,
        renameValue: node.name,
      }));
    },
    [fsNodeMap],
  );

  const commitRename = useCallback(async () => {
    if (!state.renamingNodeId || !state.renameValue.trim()) {
      setState((prev) => ({
        ...prev,
        renamingNodeId: null,
        renameValue: "",
      }));

      return;
    }

    await fsRenameNode(state.renamingNodeId, state.renameValue.trim());

    setState((prev) => ({
      ...prev,
      renamingNodeId: null,
      renameValue: "",
    }));
  }, [state.renamingNodeId, state.renameValue, fsRenameNode]);

  const cancelRename = useCallback(() => {
    setState((prev) => ({
      ...prev,
      renamingNodeId: null,
      renameValue: "",
    }));
  }, []);

  const setRenameValue = useCallback((value: string) => {
    setState((prev) => ({ ...prev, renameValue: value }));
  }, []);

  // ── Clipboard ───────────────────────────────────────

  const cutSelected = useCallback(() => {
    const ids = Array.from(state.selectedNodeIds);

    if (ids.length > 0) {
      fsCut(ids);
    }
  }, [state.selectedNodeIds, fsCut]);

  const copySelected = useCallback(() => {
    const ids = Array.from(state.selectedNodeIds);

    if (ids.length > 0) {
      fsCopy(ids);
    }
  }, [state.selectedNodeIds, fsCopy]);

  const pasteHere = useCallback(async () => {
    const parentId = state.currentDirId;

    if (!parentId) {
      return;
    }

    await fsPaste(parentId);
  }, [state.currentDirId, fsPaste]);

  // ── Search ──────────────────────────────────────────

  const setSearchQuery = useCallback(
    (query: string) => {
      setState((prev) => ({
        ...prev,
        searchQuery: query,
        isSearching: query.trim().length > 0,
      }));

      if (query.trim()) {
        fsSearch(query.trim());
      } else {
        fsClearSearch();
      }
    },
    [fsSearch, fsClearSearch],
  );

  const clearSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchQuery: "",
      isSearching: false,
    }));
    fsClearSearch();
  }, [fsClearSearch]);

  // ── View Controls ───────────────────────────────────

  const setViewMode = useCallback((mode: FilesViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setSortConfig = useCallback((config: FilesSortConfig) => {
    setState((prev) => ({ ...prev, sortConfig: config }));
  }, []);

  const toggleHidden = useCallback(() => {
    setState((prev) => ({ ...prev, showHidden: !prev.showHidden }));
  }, []);

  const closePreview = useCallback(() => {
    setState((prev) => ({ ...prev, previewNodeId: null }));
  }, []);

  // ── Context Menu ────────────────────────────────────

  const openContextMenu = useCallback(
    (x: number, y: number, nodeId: string | null) => {
      setState((prev) => ({
        ...prev,
        contextMenu: { x, y, nodeId },
      }));

      if (nodeId && !state.selectedNodeIds.has(nodeId)) {
        setState((prev) => ({
          ...prev,
          selectedNodeIds: new Set([nodeId]),
          contextMenu: { x, y, nodeId },
        }));
      }
    },
    [state.selectedNodeIds],
  );

  const closeContextMenu = useCallback(() => {
    setState((prev) => ({ ...prev, contextMenu: null }));
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const isCmd = event.metaKey || event.ctrlKey;

      if (isCmd && event.key === "a") {
        event.preventDefault();
        selectAll();

        return;
      }

      if (isCmd && event.key === "c") {
        event.preventDefault();
        copySelected();

        return;
      }

      if (isCmd && event.key === "x") {
        event.preventDefault();
        cutSelected();

        return;
      }

      if (isCmd && event.key === "v") {
        event.preventDefault();
        pasteHere();

        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (state.selectedNodeIds.size > 0 && !state.renamingNodeId) {
          event.preventDefault();
          deleteSelected();
        }

        return;
      }

      if (event.key === "Enter" && state.selectedNodeIds.size === 1) {
        event.preventDefault();
        const [nodeId] = state.selectedNodeIds;

        openNode(nodeId);

        return;
      }

      if (event.key === "Escape") {
        if (state.contextMenu) {
          closeContextMenu();
        } else if (state.previewNodeId) {
          closePreview();
        } else {
          clearSelection();
        }
      }
    },
    [
      selectAll,
      copySelected,
      cutSelected,
      pasteHere,
      deleteSelected,
      openNode,
      clearSelection,
      closeContextMenu,
      closePreview,
      state.selectedNodeIds,
      state.renamingNodeId,
      state.contextMenu,
      state.previewNodeId,
    ],
  );

  return {
    // State
    ...state,
    fsHydrated,
    fsClipboard,
    fsSearchResults,

    // Computed
    visibleChildren,
    breadcrumbTrail,
    sidebarRoots,
    previewNode,
    fsNodeMap,
    fsReadContent,

    // Navigation
    navigateTo,
    navigateUp,
    openNode,

    // Selection
    selectNode,
    selectAll,
    clearSelection,

    // CRUD
    createNewFile,
    createNewFolder,
    deleteSelected,
    startRename,
    commitRename,
    cancelRename,
    setRenameValue,

    // Clipboard
    cutSelected,
    copySelected,
    pasteHere,

    // Search
    setSearchQuery,
    clearSearch,

    // View
    setViewMode,
    setSortConfig,
    toggleHidden,
    closePreview,

    // Context menu
    openContextMenu,
    closeContextMenu,

    // Keyboard
    handleKeyDown,
  };
}
