import type { AppConfig } from "@/entities/app";

import NotesIcon from "./icon";

export const notesAppConfig: AppConfig = {
  id: "notes",
  name: "Notes",
  description: "A simple note-taking app with local persistence.",
  icon: NotesIcon,
  tint: "#facc15",
  window: {
    width: 620,
    height: 520,
    minWidth: 420,
    minHeight: 340,
  },
  load: async () => {
    const appModule = await import("./ui/notes-app");

    return { component: appModule.NotesApp };
  },
};
