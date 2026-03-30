import type { AppConfig } from "@/entities/app";

import ContactIcon from "./icon";

export const contactAppConfig: AppConfig = {
  id: "contact",
  name: "Contact",
  description: "Contextual contact workspace with reusable outreach flows and real OS handoff actions.",
  icon: ContactIcon,
  tint: "#0ea5e9",
  window: {
    width: 920,
    height: 680,
    minWidth: 720,
    minHeight: 520,
  },
  statusBar: {
    info: "Build outreach drafts, hand them off across the OS, and send a validated message.",
    sections: [
      {
        id: "contact",
        label: "Contact",
        actions: [
          {
            id: "contact-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open another contact workspace.",
          },
        ],
      },
      {
        id: "handoff",
        label: "Handoff",
        actions: [
          {
            id: "contact-open-notes",
            label: "Open Notes",
            command: { type: "open-app", appId: "notes" },
          },
          {
            id: "contact-open-ai-agent",
            label: "Open AI Agent",
            command: { type: "open-app", appId: "ai-agent" },
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "contact-open-resume",
            label: "Open Resume",
            command: { type: "open-app", appId: "resume" },
          },
          {
            id: "contact-open-portfolio",
            label: "Open Portfolio",
            command: { type: "open-app", appId: "portfolio" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/contact-app");

    return { component: appModule.ContactApp };
  },
};
