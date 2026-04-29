/**
 * Pure helpers shared across slices.
 *
 * No store imports, no `useOSStore` references — safe to import from any slice
 * without creating circular dependencies.
 */

import type { DesktopBounds } from "@/entities/window";
import type { OSSettings, AccentColor } from "@/apps/settings/model/settings.types";
import { ACCENT_COLOR_MAP, DOCK_ICON_SIZE_MAP } from "@/apps/settings/model/settings.types";
import type { OSStore } from "../store.types";
import {
  getWorkspaceById,
  updateWorkspaceSplitViewModel,
} from "../../workspace-manager";

export const DEFAULT_LAUNCH_BOUNDS: DesktopBounds = {
  width: 1440,
  height: 900,
  insetTop: 42,
  insetRight: 24,
  insetBottom: 120,
  insetLeft: 24,
};

// ── DOM Side-effects ──────────────────────────────────────────────────────────

export function applySettingsToDOM(settings: OSSettings): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  // Color scheme
  const isDark =
    settings.colorScheme === "dark" ||
    (settings.colorScheme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }

  // Accent color
  const accent = ACCENT_COLOR_MAP[settings.accentColor as AccentColor];

  if (accent) {
    root.style.setProperty("--accent", accent.value);
  }

  // Dock icon size
  const dockSize = DOCK_ICON_SIZE_MAP[settings.dockIconSize];

  if (dockSize) {
    root.style.setProperty("--dock-icon-size", `${dockSize.px}px`);
  }

  // Reduced transparency
  if (settings.reduceTransparency) {
    root.setAttribute("data-reduced-transparency", "");
  } else {
    root.removeAttribute("data-reduced-transparency");
  }
}

// ── Split workspace collapse ──────────────────────────────────────────────────

export function collapseSplitWorkspaceForWindow(input: {
  state: OSStore;
  windowId: string;
  bounds: Pick<DesktopBounds, "width" | "height">;
}) {
  const workspace = getWorkspaceById(input.state.workspaces, input.state.currentWorkspaceId);
  const targetWindow = input.state.windowRecord[input.windowId];

  if (!workspace || !targetWindow || !workspace.splitView) {
    return null;
  }

  const splitView = workspace.splitView;
  const remainingWindowId =
    splitView.leftWindowId === input.windowId
      ? splitView.rightWindowId
      : splitView.rightWindowId === input.windowId
        ? splitView.leftWindowId
        : null;

  if (!remainingWindowId) {
    return null;
  }

  const nextWorkspaceState = updateWorkspaceSplitViewModel(input.state, {
    workspaceId: workspace.id,
    splitView: null,
  });
  const remainingWindow = input.state.windowRecord[remainingWindowId];

  if (!remainingWindow) {
    return {
      workspaces: nextWorkspaceState.workspaces,
      splitResizeState: nextWorkspaceState.splitResizeState,
      activeWindowId: input.state.activeWindowId,
      windows: input.state.windows,
    };
  }

  const nextWindows = input.state.windows.map((window) => {
    if (window.id !== remainingWindowId) {
      return window;
    }

    return {
      ...window,
      workspaceId: workspace.id,
      isFullscreen: true,
      position: { x: 0, y: 0 },
      size: {
        width: Math.max(320, input.bounds.width),
        height: Math.max(240, input.bounds.height),
      },
    };
  });

  return {
    workspaces: nextWorkspaceState.workspaces,
    splitResizeState: nextWorkspaceState.splitResizeState,
    activeWindowId: remainingWindowId,
    windows: nextWindows,
  };
}
