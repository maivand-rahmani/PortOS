import type { AppConfig } from "@/entities/app";

import SystemInfoIcon from "./icon";

export const systemInfoAppConfig: AppConfig = {
  id: "system-info",
  name: "System Info",
  description: "Live runtime metrics, diagnostics, and actionable process and window incident workflows.",
  icon: SystemInfoIcon,
  tint: "#111111",
  window: {
    width: 1160,
    height: 760,
    minWidth: 920,
    minHeight: 620,
    launchMaximized: true,
  },
  statusBar: {
    info: "Inspect runtime processes, spotlight windows, and export incident snapshots.",
    sections: [
      {
        id: "system-info",
        label: "System Info",
        actions: [
          {
            id: "system-info-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open another monitoring view.",
          },
        ],
      },
      {
        id: "tools",
        label: "Tools",
        actions: [
          {
            id: "system-info-open-settings",
            label: "Open Settings",
            command: { type: "open-app", appId: "settings" },
          },
          {
            id: "system-info-open-terminal",
            label: "Open Terminal",
            command: { type: "open-app", appId: "terminal" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/system-info-app");

    return { component: appModule.SystemInfoApp };
  },
};
