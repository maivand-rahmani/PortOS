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
  load: async () => {
    const appModule = await import("./ui/docs-app");

    return { component: appModule.DocsApp };
  },
};
