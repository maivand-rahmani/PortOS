import type { AppConfig } from "@/entities/app";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";
import type { WorkspaceDefinition, WorkspaceId } from "@/entities/workspace";

import {
  DESKTOP_ICON_FRAME,
  DESKTOP_ICON_SPACING,
  DESKTOP_INSETS,
  getDesktopIconConfig,
} from "./desktop-shell.constants";
import type { ViewMode } from "@/processes/os/model/desktop-manager";
import type { DockMenuEntry } from "./desktop-shell.types";
import type { DesktopIconMap, DockAppState, DockWindowItem } from "./desktop-shell.types";

export function sortWorkspaces(workspaces: WorkspaceDefinition[]) {
  return [...workspaces].sort((left, right) => left.order - right.order);
}

function getDesktopIconRows(bounds: DesktopBounds | null) {
  if (!bounds) {
    return 5;
  }

  const usableHeight =
    bounds.height - bounds.insetTop - bounds.insetBottom - DESKTOP_ICON_FRAME.height;

  return Math.max(1, Math.floor(usableHeight / DESKTOP_ICON_SPACING.y) + 1);
}

function getInitialDesktopIconPosition(index: number, bounds: DesktopBounds | null) {
  const rows = getDesktopIconRows(bounds);
  const row = index % rows;
  const column = Math.floor(index / rows);
  const baseX = bounds
    ? bounds.width - DESKTOP_INSETS.right - DESKTOP_ICON_FRAME.width
    : DESKTOP_INSETS.left;

  return {
    x: Math.max(DESKTOP_INSETS.left, baseX - column * DESKTOP_ICON_SPACING.x),
    y: DESKTOP_INSETS.top + 20 + row * DESKTOP_ICON_SPACING.y,
  };
}

export function clampDesktopIconPosition(
  position: WindowPosition,
  bounds: DesktopBounds,
): WindowPosition {
  const maxX = Math.max(
    bounds.insetLeft,
    bounds.width - bounds.insetRight - DESKTOP_ICON_FRAME.width,
  );
  const maxY = Math.max(
    bounds.insetTop,
    bounds.height - bounds.insetBottom - DESKTOP_ICON_FRAME.height,
  );

  return {
    x: Math.min(Math.max(position.x, bounds.insetLeft), maxX),
    y: Math.min(Math.max(position.y, bounds.insetTop), maxY),
  };
}

export function snapToRightAlignedGrid(
  position: WindowPosition,
  bounds: DesktopBounds,
  frame: { width: number },
  spacing: { x: number; y: number },
): WindowPosition {
  const baseX = bounds.width - DESKTOP_INSETS.right - frame.width;
  const col = Math.max(0, Math.round((baseX - position.x) / spacing.x));
  const row = Math.max(0, Math.round((position.y - (DESKTOP_INSETS.top + 20)) / spacing.y));

  return {
    x: Math.max(DESKTOP_INSETS.left, baseX - col * spacing.x),
    y: DESKTOP_INSETS.top + 20 + row * spacing.y,
  };
}

export function positionToCellRightAligned(
  position: WindowPosition,
  bounds: DesktopBounds,
  frame: { width: number },
  spacing: { x: number; y: number },
): { row: number; col: number } {
  const baseX = bounds.width - DESKTOP_INSETS.right - frame.width;
  return {
    row: Math.max(0, Math.round((position.y - (DESKTOP_INSETS.top + 20)) / spacing.y)),
    col: Math.max(0, Math.round((baseX - position.x) / spacing.x)),
  };
}

export function cellToPositionRightAligned(
  cell: { row: number; col: number },
  bounds: DesktopBounds,
  frame: { width: number },
  spacing: { x: number; y: number },
): WindowPosition {
  const baseX = bounds.width - DESKTOP_INSETS.right - frame.width;
  return {
    x: Math.max(DESKTOP_INSETS.left, baseX - cell.col * spacing.x),
    y: DESKTOP_INSETS.top + 20 + cell.row * spacing.y,
  };
}

export function getOccupiedCellsRightAligned(
  positions: Record<string, WindowPosition>,
  bounds: DesktopBounds,
  frame: { width: number },
  spacing: { x: number; y: number },
): Set<string> {
  const occupied = new Set<string>();
  for (const _id of Object.keys(positions)) {
    const pos = positions[_id];
    const cell = positionToCellRightAligned(pos, bounds, frame, spacing);
    occupied.add(`${cell.row},${cell.col}`);
  }
  return occupied;
}

export function resolveCollisionRightAligned(
  desiredCell: { row: number; col: number },
  occupiedCells: Set<string>,
  maxRows: number,
  maxCols: number,
): { row: number; col: number } {
  const key = (r: number, c: number) => `${r},${c}`;

  if (!occupiedCells.has(key(desiredCell.row, desiredCell.col))) {
    return desiredCell;
  }

  const maxRadius = Math.max(maxRows, maxCols);

  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const onBoundary = Math.abs(dr) === radius || Math.abs(dc) === radius;
        if (!onBoundary) continue;

        const r = desiredCell.row + dr;
        const c = desiredCell.col + dc;

        if (r < 0 || r >= maxRows || c < 0 || c >= maxCols) continue;
        if (!occupiedCells.has(key(r, c))) {
          return { row: r, col: c };
        }
      }
    }
  }

  return desiredCell;
}

export function syncDesktopIconPositions(
  apps: AppConfig[],
  bounds: DesktopBounds | null,
  currentPositions: DesktopIconMap,
): DesktopIconMap {
  const nextPositions: DesktopIconMap = {};

  const appIds = new Set(apps.map((a) => a.id));
  for (const [key, pos] of Object.entries(currentPositions)) {
    if (!appIds.has(key)) {
      nextPositions[key] = bounds ? clampDesktopIconPosition(pos, bounds) : pos;
    }
  }

  apps.forEach((app, index) => {
    const existingPosition = currentPositions[app.id];

    nextPositions[app.id] = existingPosition
      ? bounds
        ? clampDesktopIconPosition(existingPosition, bounds)
        : existingPosition
      : getInitialDesktopIconPosition(index, bounds);
  });

  return nextPositions;
}

export function getDockAppStates(
  apps: AppConfig[],
  windows: WindowInstance[],
  activeWindowId: string | null,
  currentWorkspaceId: WorkspaceId,
): DockAppState[] {
  return apps.map((app) => {
    const appWindows: DockWindowItem[] = windows
      .filter((window) => window.appId === app.id)
      .sort((left, right) => right.zIndex - left.zIndex)
      .map((window) => ({
        id: window.id,
        title: window.title,
        workspaceId: window.workspaceId,
        isMinimized: window.isMinimized,
        isActive: window.id === activeWindowId,
        zIndex: window.zIndex,
      }));
    const currentWorkspaceWindows = appWindows.filter(
      (window) => window.workspaceId === currentWorkspaceId,
    );
    const visibleWindows = currentWorkspaceWindows.filter((window) => !window.isMinimized);
    const minimizedWindows = currentWorkspaceWindows.filter((window) => window.isMinimized);
    const activeWindow = currentWorkspaceWindows.find((window) => window.isActive) ?? null;

    return {
      app,
      windows: appWindows,
      visibleWindows,
      minimizedWindows,
      openCount: appWindows.length,
      visibleCount: visibleWindows.length,
      minimizedCount: minimizedWindows.length,
      isRunning: appWindows.length > 0,
      isFrontmost: activeWindow?.id != null,
      activeWindowId: activeWindow?.id ?? null,
    };
  });
}

export function getDockMenuEntries(item: DockAppState): DockMenuEntry[] {
  const entries: DockMenuEntry[] = [];

  entries.push({
    kind: "action",
    action: {
      id: item.isRunning ? "new-window" : "open-app",
      appId: item.app.id,
      label: item.isRunning ? `New ${item.app.name} Window` : `Open ${item.app.name}`,
    },
  });

  if (item.minimizedWindows.length > 0) {
    entries.push({
      kind: "action",
      action: {
        id: "restore-all-windows",
        appId: item.app.id,
        label: `Restore ${item.minimizedWindows.length} Minimized`,
      },
    });
  }

  if (item.windows.length > 0) {
    entries.push({
      kind: "separator",
      key: `${item.app.id}-windows`,
    });

    item.windows.forEach((window) => {
      entries.push({
        kind: "action",
        action: {
          id: window.isMinimized ? "restore-window" : "focus-window",
          appId: item.app.id,
          windowId: window.id,
          label: window.isMinimized ? `Restore ${window.title}` : `Show ${window.title}`,
        },
      });

      if (!window.isMinimized) {
        entries.push({
          kind: "action",
          action: {
            id: "minimize-window",
            appId: item.app.id,
            windowId: window.id,
            label: `Minimize ${window.title}`,
          },
        });
      }
    });

    entries.push({
      kind: "separator",
      key: `${item.app.id}-quit`,
    });
    entries.push({
      kind: "action",
      action: {
        id: "quit-app",
        appId: item.app.id,
        label: `Quit ${item.app.name}`,
      },
    });
  }

  return entries;
}
