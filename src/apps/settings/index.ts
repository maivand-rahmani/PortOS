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
  load: async () => {
    const appModule = await import("./ui/settings-app");

    return { component: appModule.SettingsApp };
  },
};
