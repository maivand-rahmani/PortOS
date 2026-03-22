import { BookOpenText } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const docsAppConfig: AppConfig = {
  id: "docs",
  name: "Docs",
  description: "Project documentation viewer.",
  icon: BookOpenText,
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
