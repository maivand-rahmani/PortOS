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
  statusBar: {
    info: "Explore selected work, case studies, and project outcomes.",
    sections: [
      {
        id: "portfolio",
        label: "Portfolio",
        actions: [
          {
            id: "portfolio-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Compare multiple case studies side by side.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "portfolio-open-resume",
            label: "Open Resume",
            command: { type: "open-app", appId: "resume" },
          },
          {
            id: "portfolio-open-contact",
            label: "Open Contact",
            command: { type: "open-app", appId: "contact" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/portfolio-app");

    return { component: appModule.PortfolioApp };
  },
};
