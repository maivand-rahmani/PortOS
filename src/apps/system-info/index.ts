import { ActivitySquare } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const systemInfoAppConfig: AppConfig = {
  id: "system-info",
  name: "System Info",
  description: "Displays real runtime state and allows terminating processes.",
  icon: ActivitySquare,
  tint: "#2563eb",
  window: {
    width: 760,
    height: 520,
    minWidth: 560,
    minHeight: 380,
  },
  load: async () => {
    const appModule = await import("./ui/system-info-app");

    return { component: appModule.SystemInfoApp };
  },
};
