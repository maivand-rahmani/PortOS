import { installedApps } from "@/apps";
import type { AppConfig, AppConfigMap } from "@/entities/app";

export type AppRegistryState = {
  apps: AppConfig[];
  appMap: AppConfigMap;
  loadedApps: Record<string, Awaited<ReturnType<AppConfig["load"]>>["component"]>;
};

export const appRegistryInitialState: AppRegistryState = {
  apps: installedApps,
  appMap: indexAppConfigs(installedApps),
  loadedApps: {},
};

export function createAppRegistryModel(
  overrides: Partial<AppRegistryState> = {},
): AppRegistryState {
  return {
    ...appRegistryInitialState,
    ...overrides,
  };
}

export function indexAppConfigs(apps: AppConfig[]): AppConfigMap {
  return Object.fromEntries(apps.map((app) => [app.id, app]));
}

export async function loadAppModule(app: AppConfig) {
  return app.load();
}
