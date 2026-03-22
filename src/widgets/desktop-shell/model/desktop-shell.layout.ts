import type { AppConfig } from "@/entities/app";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";

import { DESKTOP_ICON_FRAME, DESKTOP_ICON_SPACING, DESKTOP_INSETS } from "./desktop-shell.constants";
import type { DesktopIconMap, DockAppState } from "./desktop-shell.types";

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
): DockAppState[] {
  return apps.map((app) => {
    const appWindows = windows.filter((window) => window.appId === app.id);

    return {
      app,
      openCount: appWindows.length,
      visibleCount: appWindows.filter((window) => !window.isMinimized).length,
      minimizedCount: appWindows.filter((window) => window.isMinimized).length,
    };
  });
}
