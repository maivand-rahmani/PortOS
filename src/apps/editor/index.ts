import type { AppConfig } from "@/entities/app";

import EditorIcon from "./icon";

export const editorAppConfig: AppConfig = {
  id: "editor",
  name: "Editor",
  description:
    "Document editor with support for plain text, Markdown, JSON, and code files.",
  icon: EditorIcon,
  tint: "#7c3aed",
  window: {
    width: 960,
    height: 680,
    minWidth: 560,
    minHeight: 400,
  },
  statusBar: {
    info: "Edit text files with syntax-aware tooling, live preview, and auto-save.",
    sections: [
      {
        id: "editor",
        label: "Editor",
        actions: [
          {
            id: "editor-new-window",
            label: "New Window",
            command: { type: "new-window" },
            info: "Open another Editor window.",
          },
        ],
      },
      {
        id: "related",
        label: "Related",
        actions: [
          {
            id: "editor-open-files",
            label: "Open Files",
            command: { type: "open-app", appId: "files" },
          },
          {
            id: "editor-open-terminal",
            label: "Open Terminal",
            command: { type: "open-app", appId: "terminal" },
          },
        ],
      },
    ],
  },
  load: async () => {
    const appModule = await import("./ui/editor-app/editor-app");

    return { component: appModule.EditorApp };
  },
};
