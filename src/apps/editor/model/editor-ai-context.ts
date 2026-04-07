import type { AiServiceContext } from "@/processes";
import type { FileNode } from "@/entities/file-system";

import type { EditorDocument } from "./editor.types";

export function buildEditorAiContext(input: {
  windowId: string;
  node: FileNode | null;
  document: EditorDocument | null;
  selectionText: string;
  selectionStart: number;
  selectionEnd: number;
  isDirty: boolean;
}): AiServiceContext {
  const file = input.node && input.document
    ? {
        nodeId: input.document.nodeId,
        path: input.document.path,
        name: input.document.name,
        mimeType: input.node.mimeType,
        content: input.document.content,
      }
    : undefined;

  return {
    sourceAppId: "editor",
    sourceWindowId: input.windowId,
    file,
    selection: input.selectionText
      ? {
          text: input.selectionText,
        }
      : undefined,
    appState: {
      mode: input.document?.mode ?? null,
      isDirty: input.isDirty,
      selectionStart: input.selectionStart,
      selectionEnd: input.selectionEnd,
    },
  };
}
