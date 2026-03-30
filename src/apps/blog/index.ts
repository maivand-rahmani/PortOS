import type { AppConfig } from "@/entities/app";

import BlogIcon from "./icon";

export const blogAppConfig: AppConfig = {
  id: "blog",
  name: "Blog",
  description: "Personal blog reader with queue, highlights, and app handoffs.",
  icon: BlogIcon,
  tint: "#7c3aed",
  window: {
    width: 1120,
    height: 700,
    minWidth: 760,
    minHeight: 520,
  },
  statusBar: {
    info: "Read posts, save highlights, and route the best ideas into other apps.",
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
            id: "blog-open-notes",
            label: "Open Notes",
            command: { type: "open-app", appId: "notes" },
          },
          {
            id: "blog-open-agent",
            label: "Open AI Agent",
            command: { type: "open-app", appId: "ai-agent" },
          },
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
