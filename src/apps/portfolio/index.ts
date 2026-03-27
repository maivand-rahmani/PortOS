import type { AppConfig } from "@/entities/app";

import PortfolioIcon from "./icon";

export const portfolioAppConfig: AppConfig = {
  id: "portfolio",
  name: "Portfolio",
  description: "Interactive browser for project case studies.",
  icon: PortfolioIcon,
  tint: "#18181b",
  window: {
    width: 1220,
    height: 780,
    minWidth: 900,
    minHeight: 620,
  },
  load: async () => {
    const appModule = await import("./ui/portfolio-app");

    return { component: appModule.PortfolioApp };
  },
};
