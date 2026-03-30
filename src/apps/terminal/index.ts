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
  statusBar: {
    info: "Runs local shell-style commands and opens PortOS apps.",
    sections: [
      {
        id: "terminal",
        label: "Terminal",
        actions: [
          {
            id: "terminal-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open another shell session.",
          },
        ],
      },
      {
        id: "shortcuts",
        label: "Shortcuts",
        actions: [
          {
            id: "terminal-open-docs",
            label: "Open Docs",
            command: { type: "open-app", appId: "docs" },
          },
          {
            id: "terminal-open-system-info",
            label: "Open System Info",
            command: { type: "open-app", appId: "system-info" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/terminal-app");

    return { component: appModule.TerminalApp };
  },
};
