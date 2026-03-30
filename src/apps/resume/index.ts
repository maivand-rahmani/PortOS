import type { AppConfig } from "@/entities/app";

import ResumeIcon from "./icon";

export const resumeAppConfig: AppConfig = {
  id: "resume",
  name: "Resume",
  description: "Interactive resume with timeline, skills, and export.",
  icon: ResumeIcon,
  tint: "#2563eb",
  window: {
    width: 1180,
    height: 760,
    minWidth: 860,
    minHeight: 620,
  },
  statusBar: {
    info: "Review experience, skills, and project highlights.",
    sections: [
      {
        id: "resume",
        label: "Resume",
        actions: [
          {
            id: "resume-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Keep a second resume view open.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "resume-open-portfolio",
            label: "Open Portfolio",
            command: { type: "open-app", appId: "portfolio" },
          },
          {
            id: "resume-open-contact",
            label: "Open Contact",
            command: { type: "open-app", appId: "contact" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/resume-app");

    return { component: appModule.ResumeApp };
  },
};
