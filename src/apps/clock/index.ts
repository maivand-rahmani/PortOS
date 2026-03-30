import type { AppConfig } from "@/entities/app";

import ClockIcon from "./icon";

export const clockAppConfig: AppConfig = {
  id: "clock",
  name: "Clock",
  description: "A world clock app with search, favorites, and live updates.",
  icon: ClockIcon,
  tint: "#0f172a",
  window: {
    width: 1160,
    height: 760,
    minWidth: 920,
    minHeight: 620,
    launchMaximized: true,
  },
  statusBar: {
    info: "Track saved cities with live world times.",
    sections: [
      {
        id: "clock",
        label: "Clock",
        actions: [
          {
            id: "clock-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open another world clock view.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "clock-open-system-info",
            label: "Open System Info",
            command: { type: "open-app", appId: "system-info" },
          },
          {
            id: "clock-open-settings",
            label: "Open Settings",
            command: { type: "open-app", appId: "settings" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/clock-app");

    return { component: appModule.ClockApp };
  },
};
