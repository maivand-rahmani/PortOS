import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

import type { WindowSize } from "./window";

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
  icon: LucideIcon;
  tint: string;
  window: AppWindowConfig;
  load: () => Promise<LoadedAppModule>;
};

export type AppConfigMap = Record<string, AppConfig>;
export type LoadedAppMap = Record<string, LoadedAppModule["component"]>;
