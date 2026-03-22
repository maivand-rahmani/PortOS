import { Bot } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const aiAgentAppConfig: AppConfig = {
  id: "ai-agent",
  name: "AI Agent",
  description: "Project-aware assistant backed by docs and profile context.",
  icon: Bot,
  tint: "#8b5cf6",
  window: {
    width: 760,
    height: 560,
    minWidth: 520,
    minHeight: 380,
  },
  load: async () => {
    const appModule = await import("./ui/ai-agent-app");

    return { component: appModule.AIAgentApp };
  },
};
