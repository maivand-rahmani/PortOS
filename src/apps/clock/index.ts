import { Clock3 } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const clockAppConfig: AppConfig = {
  id: "clock",
  name: "Clock",
  description: "A world clock app with live updates.",
  icon: Clock3,
  tint: "#0f172a",
  window: {
    width: 580,
    height: 420,
    minWidth: 420,
    minHeight: 300,
  },
  load: async () => {
    const appModule = await import("./ui/clock-app");

    return { component: appModule.ClockApp };
  },
};
