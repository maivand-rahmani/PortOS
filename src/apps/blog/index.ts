import { Newspaper } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const blogAppConfig: AppConfig = {
  id: "blog",
  name: "Blog",
  description: "Personal blog reader with real posts.",
  icon: Newspaper,
  tint: "#7c3aed",
  window: {
    width: 760,
    height: 560,
    minWidth: 520,
    minHeight: 360,
  },
  load: async () => {
    const appModule = await import("./ui/blog-app");

    return { component: appModule.BlogApp };
  },
};
