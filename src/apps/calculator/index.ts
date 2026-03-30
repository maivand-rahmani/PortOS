import type { AppConfig } from "@/entities/app";

import CalculatorIcon from "./icon";

export const calculatorAppConfig: AppConfig = {
  id: "calculator",
  name: "Calculator",
  description: "A working calculator with expression evaluation.",
  icon: CalculatorIcon,
  tint: "#f97316",
  window: {
    width: 400,
    height: 560,
    minWidth: 340,
    minHeight: 500,
  },
  statusBar: {
    info: "Evaluate expressions in a compact focused workspace.",
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
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/calculator-app");

    return { component: appModule.CalculatorApp };
  },
};
