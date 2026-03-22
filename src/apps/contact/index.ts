import { Send } from "lucide-react";

import type { AppConfig } from "@/entities/app";

export const contactAppConfig: AppConfig = {
  id: "contact",
  name: "Contact",
  description: "Working contact form and contact information.",
  icon: Send,
  tint: "#0ea5e9",
  window: {
    width: 620,
    height: 520,
    minWidth: 440,
    minHeight: 360,
  },
  load: async () => {
    const appModule = await import("./ui/contact-app");

    return { component: appModule.ContactApp };
  },
};
