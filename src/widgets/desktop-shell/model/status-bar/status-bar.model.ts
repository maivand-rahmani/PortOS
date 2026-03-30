import type { AppConfig, AppStatusBarAction } from "@/entities/app";

import type {
  StatusBarMenuModel,
  StatusBarModel,
  StatusBarRuntimeSnapshot,
} from "./status-bar.types";

const HOME_STATUS_BAR_TITLE = "PortOS";
const HOME_STATUS_BAR_INFO = "Desktop ready";

function mapStatusBarAction(action: AppStatusBarAction): AppStatusBarAction {
  return {
    ...action,
  };
}

function getStatusBarMenu(app: AppConfig | null): StatusBarMenuModel | null {
  if (!app?.statusBar) {
    return null;
  }

  return {
    appId: app.id,
    appName: app.name,
    sections: app.statusBar.sections.map((section) => ({
      ...section,
      actions: section.actions.map(mapStatusBarAction),
    })),
  };
}

export function getStatusBarModel(snapshot: StatusBarRuntimeSnapshot): StatusBarModel {
  const activeApp = snapshot.activeApp;
  const activeWindow = snapshot.activeWindow;
  const activeProcess = snapshot.activeProcess;

  return {
    title: activeApp?.name ?? HOME_STATUS_BAR_TITLE,
    info: activeApp?.statusBar?.info ?? HOME_STATUS_BAR_INFO,
    activeApp,
    activeProcess,
    activeWindow,
    menu: getStatusBarMenu(activeApp),
    systemItems: [
      {
        id: "processes",
        label: `${snapshot.processCount} Active`,
        info:
          activeWindow && activeProcess
            ? `${activeProcess.name} focused`
            : "No focused app",
      },
    ],
    clock: {
      label: "",
    },
  };
}
