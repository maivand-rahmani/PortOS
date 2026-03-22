import { Layers3 } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const systemOverviewAppConfig: AppConfig = {
  id: "system-overview",
  name: "System Overview",
  description: "Explains the current runtime layers and verifies app loading.",
  icon: Layers3,
  tint: "var(--accent)",
  window: {
    width: 460,
    height: 360,
    minWidth: 360,
    minHeight: 280,
  },
  load: async () => {
    const appModule = await import("./ui/system-overview-app");

    return {
      component: appModule.SystemOverviewApp,
    };
  },
};
