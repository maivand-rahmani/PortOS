import type { ComponentType, SVGProps } from "react";

import type { WindowSize } from "./window";

export type AppIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type AppComponentProps = {
  processId: string;
  windowId: string;
};

export type AppWindowConfig = WindowSize & {
  minWidth?: number;
  minHeight?: number;
};

export type LoadedAppModule = {
  component: ComponentType<AppComponentProps>;
};

export type AppConfig = {
  id: string;
  name: string;
  description: string;
  icon: AppIcon;
  tint: string;
  window: AppWindowConfig;
  load: () => Promise<LoadedAppModule>;
};

export type AppConfigMap = Record<string, AppConfig>;
export type LoadedAppMap = Record<string, LoadedAppModule["component"]>;
