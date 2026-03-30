import type {
  AppConfig,
  AppStatusBarAction,
  AppStatusBarCommand,
  AppStatusBarSection,
} from "@/entities/app";
import type { ProcessInstance } from "@/entities/process";
import type { WindowInstance } from "@/entities/window";

export type StatusBarClockModel = {
  label: string;
};

export type StatusBarAppActionModel = AppStatusBarAction & {
  isDisabled?: boolean;
};

export type StatusBarSectionModel = Omit<AppStatusBarSection, "actions"> & {
  actions: StatusBarAppActionModel[];
};

export type StatusBarMenuModel = {
  appId: string;
  appName: string;
  sections: StatusBarSectionModel[];
};

export type StatusBarSystemItem = {
  id: "processes";
  label: string;
  info: string;
};

export type StatusBarModel = {
  title: string;
  info: string | null;
  activeApp: AppConfig | null;
  activeProcess: ProcessInstance | null;
  activeWindow: WindowInstance | null;
  menu: StatusBarMenuModel | null;
  systemItems: StatusBarSystemItem[];
  clock: StatusBarClockModel;
};

export type StatusBarRuntimeSnapshot = {
  activeApp: AppConfig | null;
  activeProcess: ProcessInstance | null;
  activeWindow: WindowInstance | null;
  processCount: number;
};

export type StatusBarCommandContext = {
  activeApp: AppConfig | null;
};

export type StatusBarCommandRunner = (
  command: AppStatusBarCommand,
  context?: StatusBarCommandContext,
) => void | Promise<void>;
