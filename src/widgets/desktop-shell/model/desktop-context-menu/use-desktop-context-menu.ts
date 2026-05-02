import { useCallback, useEffect, useState } from "react";
import { useOSStore } from "@/processes";
import { dispatchFilesFocusNodeRequest } from "@/shared/lib/os-events/files-os-events";
import { openAppById } from "@/shared/lib/os-actions/os-actions";
import type { WindowPosition } from "@/entities/window";
import type {
  ContextMenuTarget,
  ContextMenuState,
  ContextMenuItem,
  ViewMode,
} from "./desktop-context-menu.types";
import {
  getDesktopMenuItems,
  getFsItemMenuItems,
  getAppItemMenuItems,
} from "./desktop-context-menu.constants";
import {
  computeGridLayout,
  sortItemsByCleanUpMode,
} from "@/processes/os/model/desktop-manager";
import type { GridOrigin, SortItemMeta } from "@/processes/os/model/desktop-manager";
import type { FileNode } from "@/entities/file-system";
import { getDesktopIconConfig, DESKTOP_INSETS } from "../desktop-shell.constants";

const DESKTOP_DIRECTORY_ID = "dir-desktop";

function getNodeIdFromTarget(target: ContextMenuTarget): string | null {
  if (target.kind === "desktop-item" && target.desktopItem.kind === "fs-item") {
    return target.desktopItem.node.id;
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 KB";
  const units = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${i === 0 ? value : value.toFixed(1)} ${units[i]}`;
}

function getAppIdFromTarget(target: ContextMenuTarget): string | null {
  if (target.kind === "desktop-item" && target.desktopItem.kind === "app") {
    return target.desktopItem.app.id;
  }
  return null;
}

function computeDesktopGridPositions(
  itemIds: string[],
  viewMode: ViewMode,
): Record<string, WindowPosition> {
  const config = getDesktopIconConfig(viewMode);
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const usableHeight =
    viewportHeight - DESKTOP_INSETS.top - DESKTOP_INSETS.bottom - config.frame.height;
  const rows = Math.max(1, Math.floor(usableHeight / config.spacing.y) + 1);
  const totalCols = Math.max(1, Math.ceil(itemIds.length / rows));

  const rightEdgeX =
    typeof window !== "undefined"
      ? window.innerWidth - DESKTOP_INSETS.right - config.frame.width
      : DESKTOP_INSETS.left + 400;

  const origin: GridOrigin = {
    x: Math.max(DESKTOP_INSETS.left, rightEdgeX - (totalCols - 1) * config.spacing.x),
    y: DESKTOP_INSETS.top + 20,
  };

  return computeGridLayout(itemIds, origin, rows, config.frame, config.spacing);
}

function buildDesktopItemMetadata(
  apps: { id: string; name: string }[],
  fsNodeIds: string[],
  fsNodeMap: Record<string, { name: string; type: string; extension?: string; updatedAt: string }>,
): Record<string, SortItemMeta> {
  const metadata: Record<string, SortItemMeta> = {};

  for (const app of apps) {
    metadata[app.id] = { name: app.name, type: "app" };
  }

  for (const id of fsNodeIds) {
    const node = fsNodeMap[id];
    if (!node) continue;
    metadata[id] = {
      name: node.name,
      type: node.type === "directory" ? "directory" : "file",
      extension: node.type === "file" ? (node as FileNode).extension : undefined,
      updatedAt: node.updatedAt,
      isDirectory: node.type === "directory",
    };
  }

  return metadata;
}

function executeDesktopCleanUp(
  store: {
    apps: { id: string; name: string }[];
    fsChildMap: Record<string, string[]>;
    fsNodeMap: Record<string, { name: string; type: string; extension?: string; updatedAt: string; isHidden: boolean }>;
    desktopViewMode: ViewMode;
    setDesktopIconPositions: (positions: Record<string, WindowPosition>) => void;
    persistDesktopPositions: () => void;
  },
  mode: "by-order" | "by-name" | "by-type" | "by-date",
) {
  const appIds = store.apps.map((a) => a.id);
  const desktopChildIds = store.fsChildMap[DESKTOP_DIRECTORY_ID] ?? [];
  const fsNodeIds = desktopChildIds.filter((id) => {
    const node = store.fsNodeMap[id];
    return node != null && !node.isHidden;
  });
  const allIds = [...appIds, ...fsNodeIds];

  const metadata = buildDesktopItemMetadata(store.apps, fsNodeIds, store.fsNodeMap);

  const sortedIds = sortItemsByCleanUpMode(allIds, mode, metadata);

  const positions = computeDesktopGridPositions(sortedIds, store.desktopViewMode);

  store.setDesktopIconPositions(positions);
  store.persistDesktopPositions();
}

export function useDesktopContextMenu(opts: {
  onOpenApp: (appId: string) => void;
}) {
  const { onOpenApp } = opts;

  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    target: null,
    items: [],
  });

  const desktopSort = useOSStore((s) => s.desktopSort);
  const desktopViewMode = useOSStore((s) => s.desktopViewMode);

  const setDesktopSort = useCallback((sort: typeof desktopSort) => {
    useOSStore.getState().setDesktopSort(sort);
  }, []);

  const setDesktopViewMode = useCallback((mode: typeof desktopViewMode) => {
    useOSStore.getState().setDesktopViewMode(mode);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenuState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const openDesktopContextMenu = useCallback(
    (position: WindowPosition, target: ContextMenuTarget) => {
      const store = useOSStore.getState();
      const canPaste = (store.fsClipboard?.nodeIds.length ?? 0) > 0;

      const currentSort = store.desktopSort;
      const currentViewMode = store.desktopViewMode;

      let items: ContextMenuItem[] = [];
      let selectedFsCount = 0;

      if (target.kind === "desktop") {
        items = getDesktopMenuItems(canPaste, currentSort, currentViewMode);
      } else if (target.kind === "desktop-item") {
        if (target.desktopItem.kind === "app") {
          items = getAppItemMenuItems();
        } else if (target.desktopItem.kind === "fs-item") {
          selectedFsCount = store.desktopSelections.filter(
            (id) => id in store.fsNodeMap,
          ).length;
          items = getFsItemMenuItems(selectedFsCount);
        }
      }

      setContextMenuState({
        isOpen: true,
        position,
        target,
        items,
      });
    },
    [],
  );

  const runContextMenuAction = useCallback(
    async (itemId: string) => {
      const store = useOSStore.getState();
      const { target } = contextMenuState;

      try {
        switch (itemId) {
          case "new-folder": {
            await store.fsCreateDirectory(DESKTOP_DIRECTORY_ID, "New Folder");
            break;
          }

          case "new-file": {
            await store.fsCreateFile(DESKTOP_DIRECTORY_ID, "New File.txt", "");
            break;
          }

          case "refresh-desktop": {
            break;
          }

          case "paste": {
            await store.fsPaste(DESKTOP_DIRECTORY_ID);
            break;
          }

          case "sort-by-name": {
            const currentSort = store.desktopSort;
            const nextDirection = currentSort.key === "name" && currentSort.direction === "asc" ? "desc" : "asc";
            store.setDesktopSort({
              key: "name",
              direction: nextDirection,
            });
            executeDesktopCleanUp(store, "by-name");
            break;
          }

          case "sort-by-type": {
            const currentSort = store.desktopSort;
            const nextDirection = currentSort.key === "type" && currentSort.direction === "asc" ? "desc" : "asc";
            store.setDesktopSort({
              key: "type",
              direction: nextDirection,
            });
            executeDesktopCleanUp(store, "by-type");
            break;
          }

          case "sort-by-date": {
            const currentSort = store.desktopSort;
            const nextDirection = currentSort.key === "date" && currentSort.direction === "asc" ? "desc" : "asc";
            store.setDesktopSort({
              key: "date",
              direction: nextDirection,
            });
            executeDesktopCleanUp(store, "by-date");
            break;
          }

          case "view-grid": {
            store.setDesktopViewMode("grid");
            break;
          }

          case "view-compact": {
            store.setDesktopViewMode("compact");
            break;
          }

          case "clean-up": {
            executeDesktopCleanUp(store, "by-order");
            break;
          }

          case "clean-up-by-name": {
            executeDesktopCleanUp(store, "by-name");
            store.setDesktopSort({
              key: "name",
              direction:
                store.desktopSort.key === "name" && store.desktopSort.direction === "asc"
                  ? "desc"
                  : "asc",
            });
            break;
          }

          case "clean-up-by-type": {
            executeDesktopCleanUp(store, "by-type");
            store.setDesktopSort({
              key: "type",
              direction:
                store.desktopSort.key === "type" && store.desktopSort.direction === "asc"
                  ? "desc"
                  : "asc",
            });
            break;
          }

          case "clean-up-by-date": {
            executeDesktopCleanUp(store, "by-date");
            store.setDesktopSort({
              key: "date",
              direction:
                store.desktopSort.key === "date" && store.desktopSort.direction === "asc"
                  ? "desc"
                  : "asc",
            });
            break;
          }

          case "open": {
            if (!target) break;

            const appId = getAppIdFromTarget(target);
            if (appId) {
              onOpenApp(appId);
              break;
            }

            const nodeId = getNodeIdFromTarget(target);
            if (nodeId) {
              dispatchFilesFocusNodeRequest({
                nodeId,
                source: "desktop-context-menu",
              });
              await openAppById("files");
            }
            break;
          }

          case "rename": {
            if (!target) break;
            const nodeId = getNodeIdFromTarget(target);
            if (!nodeId) break;
            const node = store.fsNodeMap[nodeId];
            if (!node) break;
            store.startDesktopRename(nodeId, node.name);
            break;
          }

          case "duplicate": {
            if (!target) break;
            const nodeId = getNodeIdFromTarget(target);
            if (nodeId) {
              await store.fsCopyNode(nodeId, DESKTOP_DIRECTORY_ID);
            }
            break;
          }

          case "move-to-trash": {
            if (!target) break;
            const nodeId = getNodeIdFromTarget(target);
            if (nodeId) {
              await store.fsDeleteNode(nodeId);
            }
            break;
          }

          case "get-info": {
            if (!target || target.kind !== "desktop-item" || target.desktopItem.kind !== "fs-item") break;
            const n = target.desktopItem.node;
            const isFile = n.type === "file";
            const sizeLabel = isFile ? formatFileSize((n as FileNode).size) : "—";
            const typeLabel = isFile
              ? `${(n as FileNode).extension.toUpperCase()} File`
              : "Folder";
            const body = [
              `Type: ${typeLabel}`,
              `Size: ${sizeLabel}`,
              `Created: ${new Date(n.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
              `Modified: ${new Date(n.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
            ].join("\n");

            store.pushNotification({
              title: n.name,
              body,
              level: "info",
            });
            break;
          }

          case "change-wallpaper": {
            await store.activateApp("settings");
            break;
          }

          case "reveal-in-files": {
            if (!target) break;
            const nodeId = getNodeIdFromTarget(target);
            if (nodeId) {
              dispatchFilesFocusNodeRequest({
                nodeId,
                source: "desktop-context-menu",
              });
              await openAppById("files");
            }
            break;
          }

          default: {
            break;
          }
        }
      } catch (error) {
        console.error(`Error executing context menu action "${itemId}":`, error);
      } finally {
        closeContextMenu();
      }
    },
    [contextMenuState, onOpenApp, closeContextMenu],
  );

  useEffect(() => {
    if (!contextMenuState.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeContextMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenuState.isOpen, closeContextMenu]);

  return {
    contextMenuState,
    openDesktopContextMenu,
    closeContextMenu,
    runContextMenuAction,
    desktopSort,
    setDesktopSort,
    desktopViewMode,
    setDesktopViewMode,
  };
}
