import type { AppConfig, AppStatusBarAction } from "@/entities/app";

import type {
  StatusBarMenuModel,
  StatusBarModel,
  StatusBarRuntimeSnapshot,
} from "./status-bar.types";

const HOME_STATUS_BAR_TITLE = "PortOS";
const HOME_STATUS_BAR_INFO = "Desktop ready for the next launch.";

function mapStatusBarAction(action: AppStatusBarAction): AppStatusBarAction {
  return {
    ...action,
  };
}

function getHomeStatusInfo(snapshot: StatusBarRuntimeSnapshot) {
  if (snapshot.processCount > 0) {
    return `Desktop ready with ${snapshot.processCount} background app${snapshot.processCount === 1 ? "" : "s"}.`;
  }

  return HOME_STATUS_BAR_INFO;
}

function getProcessStatus(snapshot: StatusBarRuntimeSnapshot) {
  if (snapshot.activeWindow && snapshot.activeProcess) {
    return {
      label: `${snapshot.processCount} Active`,
      info: `${snapshot.activeProcess.name} focused`,
    };
  }

  if (snapshot.processCount > 0) {
    return {
      label: `${snapshot.processCount} Running`,
      info: `${snapshot.processCount} background app${snapshot.processCount === 1 ? " is" : "s are"} open from the desktop.`,
    };
  }

  return {
    label: "Desktop Idle",
    info: "No active app yet. Use the menu, dock, or Maivand to open one.",
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
  const processStatus = getProcessStatus(snapshot);

  return {
    title: activeApp?.name ?? HOME_STATUS_BAR_TITLE,
    info: activeApp?.statusBar?.info ?? getHomeStatusInfo(snapshot),
    activeApp,
    activeProcess,
    activeWindow,
    menu: getStatusBarMenu(activeApp),
    systemItems: [
      {
        id: "processes",
        label: processStatus.label,
        info: processStatus.info,
      },
    ],
    clock: {
      label: "",
    },
  };
}
