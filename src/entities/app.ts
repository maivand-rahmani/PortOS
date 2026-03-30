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
  launchMaximized?: boolean;
};

export type AppStatusBarCommand =
  | {
      type: "new-window";
    }
  | {
      type: "open-app";
      appId: string;
    }
  | {
      type: "open-url";
      href: string;
      target?: "_blank" | "_self";
    };

export type AppStatusBarAction = {
  id: string;
  label: string;
  command: AppStatusBarCommand;
  info?: string;
};

export type AppStatusBarSection = {
  id: string;
  label: string;
  actions: AppStatusBarAction[];
};

export type AppStatusBarConfig = {
  info?: string;
  sections: AppStatusBarSection[];
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
  statusBar?: AppStatusBarConfig;
  load: () => Promise<LoadedAppModule>;
};

export type AppConfigMap = Record<string, AppConfig>;
export type LoadedAppMap = Record<string, LoadedAppModule["component"]>;
