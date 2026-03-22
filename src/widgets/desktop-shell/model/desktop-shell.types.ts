import type { RefObject } from "react";

import type { AppConfig, LoadedAppMap } from "@/entities/app";
import type { DesktopBounds, WindowInstance, WindowPosition } from "@/entities/window";
import type { OSBootPhase } from "@/processes";

export type DesktopIconPosition = WindowPosition;

export type DesktopIconMap = Record<string, DesktopIconPosition>;

export type DesktopIconDragState = {
  appId: string;
  offset: WindowPosition;
} | null;

export type WindowRenderItem = {
  window: WindowInstance;
  app: AppConfig;
  AppComponent: LoadedAppMap[string] | null;
  isActive: boolean;
  isDragging: boolean;
};

export type DockAppState = {
  app: AppConfig;
  openCount: number;
  visibleCount: number;
  minimizedCount: number;
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
  dockApps: DockAppState[];
  minimizedWindows: WindowInstance[];
  visibleWindows: WindowRenderItem[];
  clearDesktopSelection: () => void;
  selectDesktopApp: (appId: string | null) => void;
  openDesktopApp: (appId: string) => void;
  beginDesktopIconDrag: (appId: string, pointer: WindowPosition) => void;
  focusWindow: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  toggleWindowMaximize: (windowId: string) => void;
  beginWindowDrag: (windowId: string, pointer: WindowPosition) => void;
};
