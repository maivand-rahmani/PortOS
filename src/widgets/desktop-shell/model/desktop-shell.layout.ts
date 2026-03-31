import type { AppConfig } from "@/entities/app";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";
import type { WorkspaceId } from "@/entities/workspace";

import { DESKTOP_ICON_FRAME, DESKTOP_ICON_SPACING, DESKTOP_INSETS } from "./desktop-shell.constants";
import type { DockMenuEntry } from "./desktop-shell.types";
import type { DesktopIconMap, DockAppState, DockWindowItem } from "./desktop-shell.types";

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

export function syncDesktopIconPositions(
  apps: AppConfig[],
  bounds: DesktopBounds | null,
  currentPositions: DesktopIconMap,
): DesktopIconMap {
  const nextPositions: DesktopIconMap = {};

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
