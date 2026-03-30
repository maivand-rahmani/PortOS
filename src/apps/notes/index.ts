import type { AppConfig } from "@/entities/app";

import NotesIcon from "./icon";

export const notesAppConfig: AppConfig = {
  id: "notes",
  name: "Notes",
  description: "A notebook-style notes app with local persistence, tagging, and external draft intake.",
  icon: NotesIcon,
  tint: "#facc15",
  window: {
    width: 620,
    height: 520,
    minWidth: 420,
    minHeight: 340,
  },
  statusBar: {
    info: "Notes autosave locally in this browser.",
    sections: [
      {
        id: "notes",
        label: "Notes",
        actions: [
          {
            id: "notes-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open another note workspace.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "notes-open-ai-agent",
            label: "Open Maivand",
            command: { type: "open-app", appId: "ai-agent" },
          },
          {
            id: "notes-open-calculator",
            label: "Open Calculator",
            command: { type: "open-app", appId: "calculator" },
          },
          {
            id: "notes-open-docs",
            label: "Open Docs",
            command: { type: "open-app", appId: "docs" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/notes-app");

    return { component: appModule.NotesApp };
  },
};
