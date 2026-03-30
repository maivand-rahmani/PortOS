import type { AppConfig } from "@/entities/app";

import CalculatorIcon from "./icon";

export const calculatorAppConfig: AppConfig = {
  id: "calculator",
  name: "Calculator",
  description: "A compact calculator with reusable tape history and Notes or AI handoff.",
  icon: CalculatorIcon,
  tint: "#f97316",
  window: {
    width: 400,
    height: 720,
    minWidth: 340,
    minHeight: 620,
  },
  statusBar: {
    info: "Evaluate expressions, keep a working tape, and hand calculations off across the OS.",
    sections: [
      {
        id: "calculator",
        label: "Calculator",
        actions: [
          {
            id: "calculator-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open a separate calculation pad.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "calculator-open-notes",
            label: "Open Notes",
            command: { type: "open-app", appId: "notes" },
          },
          {
            id: "calculator-open-ai-agent",
            label: "Open AI Agent",
            command: { type: "open-app", appId: "ai-agent" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/calculator-app");

    return { component: appModule.CalculatorApp };
  },
};
