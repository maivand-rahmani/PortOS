import type { AppConfig } from "@/entities/app";

import ContactIcon from "./icon";

export const contactAppConfig: AppConfig = {
  id: "contact",
  name: "Contact",
  description: "Working contact form and contact information.",
  icon: ContactIcon,
  tint: "#0ea5e9",
  window: {
    width: 620,
    height: 520,
    minWidth: 440,
    minHeight: 360,
  },
  statusBar: {
    info: "Reach Maivand through real contact details and form actions.",
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
