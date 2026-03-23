import type { AppConfig } from "@/entities/app";

import BlogIcon from "./icon";

export const blogAppConfig: AppConfig = {
  id: "blog",
  name: "Blog",
  description: "Personal blog reader with real posts.",
  icon: BlogIcon,
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
