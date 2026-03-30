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
  statusBar: {
    info: "Read local writing and portfolio updates.",
    sections: [
      {
        id: "blog",
        label: "Blog",
        actions: [
          {
            id: "blog-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Read multiple posts at once.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "blog-open-portfolio",
            label: "Open Portfolio",
            command: { type: "open-app", appId: "portfolio" },
          },
          {
            id: "blog-open-contact",
            label: "Open Contact",
            command: { type: "open-app", appId: "contact" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/blog-app");

    return { component: appModule.BlogApp };
  },
};
