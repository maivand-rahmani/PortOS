import type { RefObject } from "react";

import type { AppConfig, LoadedAppMap } from "@/entities/app";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";
import type { OSBootPhase, WindowResizeDirection } from "@/processes";

export type DesktopIconPosition = WindowPosition;

export type DesktopIconMap = Record<string, DesktopIconPosition>;

export type DesktopIconDragState = {
  appId: string;
  offset: WindowPosition;
} | null;

export type DesktopWidgetDragState = {
  offset: WindowPosition;
} | null;

export type WindowRenderItem = {
  window: WindowInstance;
  app: AppConfig;
  AppComponent: LoadedAppMap[string] | null;
  isActive: boolean;
  isDragging: boolean;
  isResizing: boolean;
};

export type DockAppState = {
  app: AppConfig;
  windows: DockWindowItem[];
  visibleWindows: DockWindowItem[];
  minimizedWindows: DockWindowItem[];
  openCount: number;
  visibleCount: number;
  minimizedCount: number;
  isRunning: boolean;
  isFrontmost: boolean;
  activeWindowId: string | null;
};

export type DockWindowItem = {
  id: string;
  title: string;
  isMinimized: boolean;
  isActive: boolean;
  zIndex: number;
};

export type DockMenuAction =
  | {
      id: "open-app" | "new-window" | "quit-app" | "restore-all-windows";
      appId: string;
      label: string;
    }
  | {
      id: "focus-window" | "restore-window" | "minimize-window";
      appId: string;
      windowId: string;
      label: string;
    };

export type DockMenuEntry =
  | {
      kind: "action";
      action: DockMenuAction;
    }
  | {
      kind: "separator";
      key: string;
    };

export type DockMenuModel = {
  item: DockAppState;
  entries: DockMenuEntry[];
  position: WindowPosition;
};

export type UseDesktopShellResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  apps: AppConfig[];
  processCount: number;
  bootPhase: OSBootPhase;
  bootProgress: number;
  desktopBounds: DesktopBounds | null;
  selectedDesktopAppId: string | null;
  desktopIconPositions: DesktopIconMap;
  aiWidgetPosition: WindowPosition | null;
  dockApps: DockAppState[];
  dockMenu: DockMenuModel | null;
  minimizedWindows: WindowInstance[];
  visibleWindows: WindowRenderItem[];
  clearDesktopSelection: () => void;
  closeDockMenu: () => void;
  selectDesktopApp: (appId: string | null) => void;
  openDesktopApp: (appId: string) => void;
  openAgentPrompt: (prompt: string) => void;
  beginAiWidgetDrag: (pointer: WindowPosition) => void;
  beginDesktopIconDrag: (appId: string, pointer: WindowPosition) => void;
  openDockMenu: (appId: string, anchor: WindowPosition) => void;
  runDockMenuAction: (action: DockMenuAction) => void;
  focusWindow: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  toggleWindowMaximize: (windowId: string) => void;
  beginWindowDrag: (windowId: string, pointer: WindowPosition) => void;
  beginWindowResize: (
    windowId: string,
    direction: WindowResizeDirection,
    pointer: WindowPosition,
  ) => void;
};
