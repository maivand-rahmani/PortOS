import type { AppConfig } from "@/entities/app";

import FilesIcon from "./icon";

export const filesAppConfig: AppConfig = {
  id: "files",
  name: "Files",
  description: "File manager with tree navigation, grid and list views, search, and file preview.",
  icon: FilesIcon,
  tint: "#2563eb",
  window: {
    width: 960,
    height: 640,
    minWidth: 640,
    minHeight: 420,
  },
  statusBar: {
    info: "Browse and manage files stored in PortOS.",
    sections: [
      {
        id: "files",
        label: "Files",
        actions: [
          {
            id: "files-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open another Files window.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "files-open-notes",
            label: "Open Notes",
            command: { type: "open-app", appId: "notes" },
          },
          {
            id: "files-open-terminal",
            label: "Open Terminal",
            command: { type: "open-app", appId: "terminal" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/files-app/files-app");

    return { component: appModule.FilesApp };
  },
};
