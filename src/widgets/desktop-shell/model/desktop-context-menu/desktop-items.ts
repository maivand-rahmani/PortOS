import type { AppConfig } from "@/entities/app";
import type { FileSystemNode, FileSystemNodeMap, FileSystemChildMap } from "@/entities/file-system";
import type { DesktopBounds, WindowPosition } from "@/entities/window";
import type { DesktopItem, DesktopAppItem, DesktopFsItem } from "./desktop-context-menu.types";
import type { DesktopIconMap } from "../desktop-shell.types";
import type { SortConfig } from "@/processes/os/model/desktop-manager";
import {
  getDesktopIconConfig,
  DESKTOP_INSETS,
} from "../desktop-shell.constants";
import {
  positionToCellRightAligned,
  getOccupiedCellsRightAligned,
} from "../desktop-shell.layout";

const DESKTOP_DIRECTORY_ID = "dir-desktop";

export type GetDesktopItemsParams = {
  apps: AppConfig[];
  fsNodeMap: FileSystemNodeMap;
  fsChildMap: FileSystemChildMap;
  desktopIconPositions: DesktopIconMap;
  desktopBounds: DesktopBounds | null;
  sortConfig?: SortConfig;
  viewMode?: "grid" | "compact";
};

function getDesktopIconRows(
  bounds: DesktopBounds | null,
  frame: { height: number },
  spacing: { y: number },
): number {
  if (!bounds) {
    return 5;
  }

  const usableHeight =
    bounds.height - bounds.insetTop - bounds.insetBottom - frame.height;

  return Math.max(1, Math.floor(usableHeight / spacing.y) + 1);
}

function computeGridPosition(
  index: number,
  rows: number,
  bounds: DesktopBounds | null,
  frame: { width: number },
  spacing: { x: number; y: number },
): WindowPosition {
  const row = index % rows;
  const column = Math.floor(index / rows);
  const baseX = bounds
    ? bounds.width - DESKTOP_INSETS.right - frame.width
    : DESKTOP_INSETS.left;

  return {
    x: Math.max(DESKTOP_INSETS.left, baseX - column * spacing.x),
    y: DESKTOP_INSETS.top + 20 + row * spacing.y,
  };
}

function isDirectory(node: FileSystemNode): node is FileSystemNode & { type: "directory" } {
  return node.type === "directory";
}

function compareBySortConfig<T extends { name: string } & Partial<{ type: string; updatedAt: string; extension: string }>>(
  a: T,
  b: T,
  config: SortConfig,
): number {
  let cmp = 0;

  switch (config.key) {
    case "name":
      cmp = a.name.localeCompare(b.name);
      break;
    case "type": {
      const extA = "extension" in a ? (a as any).extension ?? "" : "";
      const extB = "extension" in b ? (b as any).extension ?? "" : "";
      cmp = extA.localeCompare(extB);
      break;
    }
    case "date": {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      cmp = dateB - dateA;
      break;
    }
  }

  return config.direction === "desc" ? -cmp : cmp;
}

function sortFsNodes(nodes: FileSystemNode[], config: SortConfig): FileSystemNode[] {
  return [...nodes].sort((a, b) => {
    const aIsDir = isDirectory(a);
    const bIsDir = isDirectory(b);

    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;

    return compareBySortConfig(a, b, config);
  });
}

function findFreeGridIndex(
  startIndex: number,
  occupiedCells: Set<string>,
  rows: number,
): number {
  let index = startIndex;
  while (true) {
    const row = index % rows;
    const col = Math.floor(index / rows);
    const cellKey = `${row},${col}`;
    if (!occupiedCells.has(cellKey)) {
      return index;
    }
    index++;
  }
}

export function getDesktopItems(params: GetDesktopItemsParams): DesktopItem[] {
  const { apps, fsNodeMap, fsChildMap, desktopIconPositions, desktopBounds, sortConfig, viewMode } = params;

  const iconConfig = getDesktopIconConfig(viewMode ?? "grid");
  const config = sortConfig ?? { key: "name" as const, direction: "asc" as const };
  const rows = getDesktopIconRows(desktopBounds, iconConfig.frame, iconConfig.spacing);
  const items: DesktopItem[] = [];

  const occupiedCells = desktopBounds
    ? getOccupiedCellsRightAligned(
        desktopIconPositions,
        desktopBounds,
        iconConfig.frame,
        iconConfig.spacing,
      )
    : new Set<string>();

  let autoGridIndex = 0;

  const sortedApps = [...apps].sort((a, b) => compareBySortConfig(a, b, config));

  const appItems: DesktopAppItem[] = sortedApps.map((app) => {
    const existingPosition = desktopIconPositions[app.id];

    let position: WindowPosition;
    if (existingPosition) {
      position = existingPosition;
    } else {
      const freeIndex = findFreeGridIndex(autoGridIndex, occupiedCells, rows);
      position = computeGridPosition(freeIndex, rows, desktopBounds, iconConfig.frame, iconConfig.spacing);
      const row = freeIndex % rows;
      const col = Math.floor(freeIndex / rows);
      occupiedCells.add(`${row},${col}`);
      autoGridIndex = freeIndex + 1;
    }

    return {
      kind: "app",
      app,
      position,
    };
  });

  const desktopChildIds = fsChildMap[DESKTOP_DIRECTORY_ID] ?? [];
  const desktopNodes = desktopChildIds
    .map((id) => fsNodeMap[id])
    .filter((node): node is FileSystemNode => node != null && !node.isHidden);

  const sortedNodes = sortFsNodes(desktopNodes, config);

  const fsItems: DesktopFsItem[] = sortedNodes.map((node) => {
    const existingPosition = desktopIconPositions[node.id];

    let position: WindowPosition;
    if (existingPosition) {
      position = existingPosition;
    } else {
      const freeIndex = findFreeGridIndex(autoGridIndex, occupiedCells, rows);
      position = computeGridPosition(freeIndex, rows, desktopBounds, iconConfig.frame, iconConfig.spacing);
      const row = freeIndex % rows;
      const col = Math.floor(freeIndex / rows);
      occupiedCells.add(`${row},${col}`);
      autoGridIndex = freeIndex + 1;
    }

    return {
      kind: "fs-item",
      node,
      position,
    };
  });

  items.push(...appItems, ...fsItems);

  return items;
}