import type { AppConfig } from "@/entities/app";

import AiAgentIcon from "./icon";

export const aiAgentAppConfig: AppConfig = {
  id: "ai-agent",
  name: "Maivand",
  description: "Developer agent that answers from portfolio context and opens PortOS apps.",
  icon: AiAgentIcon,
  tint: "#ff6b57",
  window: {
    width: 1320,
    height: 900,
    minWidth: 880,
    minHeight: 620,
    launchMaximized: true,
  },
  statusBar: {
    info: "Answers from local portfolio context and can open PortOS apps.",
    sections: [
      {
        id: "maivand",
        label: "Maivand",
        actions: [
          {
            id: "ai-agent-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Start another assistant session.",
          },
        ],
      },
      {
        id: "navigate",
        label: "Navigate",
        actions: [
          {
            id: "ai-agent-open-portfolio",
            label: "Open Portfolio",
            command: { type: "open-app", appId: "portfolio" },
          },
          {
            id: "ai-agent-open-contact",
            label: "Open Contact",
            command: { type: "open-app", appId: "contact" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/ChatWindow");

    return { component: appModule.ChatWindow };
  },
};
