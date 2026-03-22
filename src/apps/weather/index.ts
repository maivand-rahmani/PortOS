import { CloudSun } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const weatherAppConfig: AppConfig = {
  id: "weather",
  name: "Weather",
  description: "Weather forecast app backed by the project weather route.",
  icon: CloudSun,
  tint: "#0284c7",
  window: {
    width: 620,
    height: 440,
    minWidth: 420,
    minHeight: 320,
  },
  load: async () => {
    const appModule = await import("./ui/weather-app");

    return { component: appModule.WeatherApp };
  },
};
