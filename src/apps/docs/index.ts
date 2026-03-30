import type { AppConfig } from "@/entities/app";

import DocsIcon from "./icon";

export const docsAppConfig: AppConfig = {
  id: "docs",
  name: "Docs",
  description: "Project documentation viewer.",
  icon: DocsIcon,
  tint: "#0f172a",
  window: {
    width: 760,
    height: 560,
    minWidth: 520,
    minHeight: 360,
  },
  statusBar: {
    info: "Browse project docs and implementation references.",
    sections: [
      {
        id: "docs",
        label: "Docs",
        actions: [
          {
            id: "docs-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Compare documentation side by side.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "docs-open-ai-agent",
            label: "Open Maivand",
            command: { type: "open-app", appId: "ai-agent" },
          },
          {
            id: "docs-open-terminal",
            label: "Open Terminal",
            command: { type: "open-app", appId: "terminal" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/docs-app");

    return { component: appModule.DocsApp };
  },
};
