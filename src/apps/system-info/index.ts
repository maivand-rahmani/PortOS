import type { AppConfig } from "@/entities/app";

import SystemInfoIcon from "./icon";

export const systemInfoAppConfig: AppConfig = {
  id: "system-info",
  name: "System Info",
  description: "Live runtime metrics, process list, and window activity.",
  icon: SystemInfoIcon,
  tint: "#111111",
  window: {
    width: 1160,
    height: 760,
    minWidth: 920,
    minHeight: 620,
    launchMaximized: true,
  },
  load: async () => {
    const appModule = await import("./ui/system-info-app");

    return { component: appModule.SystemInfoApp };
  },
};
