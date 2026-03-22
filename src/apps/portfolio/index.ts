import { BriefcaseBusiness } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const portfolioAppConfig: AppConfig = {
  id: "portfolio",
  name: "Portfolio",
  description: "Project portfolio viewer backed by profile data.",
  icon: BriefcaseBusiness,
  tint: "#f43f5e",
  window: {
    width: 780,
    height: 560,
    minWidth: 560,
    minHeight: 380,
  },
  load: async () => {
    const appModule = await import("./ui/portfolio-app");

    return { component: appModule.PortfolioApp };
  },
};
