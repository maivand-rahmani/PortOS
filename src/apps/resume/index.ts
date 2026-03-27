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
  load: async () => {
    const appModule = await import("./ui/resume-app");

    return { component: appModule.ResumeApp };
  },
};
