import type { RefObject } from "react";

import type { AppConfig, LoadedAppMap } from "@/entities/app";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";
import type {
  WorkspaceDefinition,
  WorkspaceId,
  WorkspaceSplitView,
} from "@/entities/workspace";
import type {
  FileDropTarget,
  OSBootPhase,
  WindowResizeDirection,
  WindowSnapZone,
} from "@/processes";

import type { StatusBarModel } from "./status-bar";

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

export type WorkspaceRenderItem = {
  workspace: WorkspaceDefinition;
  windows: WindowRenderItem[];
  isActive: boolean;
};

export type SplitViewPickerState = {
  workspaceId: WorkspaceId;
  anchorWindowId: string;
  side: "left" | "right";
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
  workspaceId: WorkspaceId;
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
  activeApp: AppConfig | null;
  activeWindow: WindowInstance | null;
  processCount: number;
  bootPhase: OSBootPhase;
  bootProgress: number;
  bootMessages: string[];
  desktopBounds: DesktopBounds | null;
  selectedDesktopAppId: string | null;
  desktopIconPositions: DesktopIconMap;
  aiWidgetPosition: WindowPosition | null;
  dockApps: DockAppState[];
  dockMenu: DockMenuModel | null;
  minimizedWindows: WindowInstance[];
  currentWorkspaceId: WorkspaceId;
  workspaces: WorkspaceDefinition[];
  currentWorkspaceIndex: number;
  isFullscreenWorkspace: boolean;
  currentSplitView: WorkspaceSplitView | null;
  splitViewPicker: SplitViewPickerState | null;
  splitViewCandidates: AppConfig[];
  fileDragNodeId: string | null;
  fileDropTarget: FileDropTarget | null;
  statusBar: StatusBarModel;
  visibleWindows: WindowRenderItem[];
  workspaceRenderItems: WorkspaceRenderItem[];
  clearDesktopSelection: () => void;
  closeDockMenu: () => void;
  selectDesktopApp: (appId: string | null) => void;
  openDesktopApp: (appId: string) => void;
  openAgentPrompt: (prompt: string) => void;
  beginAiWidgetDrag: (pointer: WindowPosition) => void;
  beginDesktopIconDrag: (appId: string, pointer: WindowPosition) => void;
  openDockMenu: (appId: string, anchor: WindowPosition) => void;
  runDockMenuAction: (action: DockMenuAction) => void;
  runStatusBarCommand: (actionId: string) => void;
  switchWorkspace: (workspaceId: WorkspaceId) => void;
  createDesktop: () => void;
  closeFullscreenSpace: (workspaceId: WorkspaceId) => void;
  beginFileDrag: (nodeId: string, pointer: WindowPosition) => void;
  setFileDropTarget: (target: FileDropTarget | null) => void;
  focusWindow: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  toggleWindowMaximize: (windowId: string) => void;
  toggleWindowFullscreen: (windowId: string) => void;
  openSplitViewPicker: (windowId: string, side: "left" | "right") => void;
  closeSplitViewPicker: () => void;
  chooseSplitViewApp: (appId: string) => void;
  beginSplitViewResize: (pointerX: number) => void;
  beginWindowDrag: (windowId: string, pointer: WindowPosition) => void;
  beginWindowResize: (
    windowId: string,
    direction: WindowResizeDirection,
    pointer: WindowPosition,
  ) => void;
  windowSnapZone: WindowSnapZone | null;
};
