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
  load: async () => {
    const appModule = await import("./ui/ChatWindow");

    return { component: appModule.ChatWindow };
  },
};
