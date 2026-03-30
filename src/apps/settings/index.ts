import type { AppConfig } from "@/entities/app";

import SettingsIcon from "./icon";

export const settingsAppConfig: AppConfig = {
  id: "settings",
  name: "Settings",
  description: "System preferences and wallpaper customization.",
  icon: SettingsIcon,
  tint: "#6366f1",
  window: {
    width: 780,
    height: 520,
    minWidth: 600,
    minHeight: 400,
  },
  statusBar: {
    info: "Adjust wallpaper and shell preferences.",
    sections: [
      {
        id: "settings",
        label: "Settings",
        actions: [
          {
            id: "settings-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open another preferences window.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "settings-open-system-info",
            label: "Open System Info",
            command: { type: "open-app", appId: "system-info" },
          },
          {
            id: "settings-open-docs",
            label: "Open Docs",
            command: { type: "open-app", appId: "docs" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/settings-app");

    return { component: appModule.SettingsApp };
  },
};
