import type { AppConfig } from "@/entities/app";

import TerminalIcon from "./icon";

export const terminalAppConfig: AppConfig = {
  id: "terminal",
  name: "Terminal",
  description: "Simple terminal emulator with real command handling.",
  icon: TerminalIcon,
  tint: "#16a34a",
  window: {
    width: 760,
    height: 520,
    minWidth: 540,
    minHeight: 360,
  },
  load: async () => {
    const appModule = await import("./ui/terminal-app");

    return { component: appModule.TerminalApp };
  },
};
