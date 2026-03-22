import { FileUser } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const resumeAppConfig: AppConfig = {
  id: "resume",
  name: "Resume",
  description: "Interactive resume backed by profile data.",
  icon: FileUser,
  tint: "#0f766e",
  window: {
    width: 760,
    height: 560,
    minWidth: 520,
    minHeight: 360,
  },
  load: async () => {
    const appModule = await import("./ui/resume-app");

    return { component: appModule.ResumeApp };
  },
};
