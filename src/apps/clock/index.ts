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
  load: async () => {
    const appModule = await import("./ui/clock-app");

    return { component: appModule.ClockApp };
  },
};
