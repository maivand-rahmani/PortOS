import { Calculator } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const calculatorAppConfig: AppConfig = {
  id: "calculator",
  name: "Calculator",
  description: "A working calculator with expression evaluation.",
  icon: Calculator,
  tint: "#f97316",
  window: {
    width: 400,
    height: 560,
    minWidth: 340,
    minHeight: 500,
  },
  load: async () => {
    const appModule = await import("./ui/calculator-app");

    return { component: appModule.CalculatorApp };
  },
};
