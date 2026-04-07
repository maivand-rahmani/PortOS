import type { AiServiceContext } from "@/processes";
import type { FileNode } from "@/entities/file-system";
import type { NoteItem } from "./notes-storage";

export function buildNotesAiContext(input: {
  windowId: string;
  note: NoteItem | null;
  noteNode: FileNode | null;
  filteredNoteCount: number;
  selectedView: "all" | "pinned" | "untagged";
  selectedTag: string | null;
  query: string;
  selectionText: string;
  selectionStart: number;
  selectionEnd: number;
}): AiServiceContext {
  return {
    sourceAppId: "notes",
    sourceWindowId: input.windowId,
    file: input.note && input.noteNode
      ? {
          nodeId: input.noteNode.id,
          path: input.note.path,
          name: input.noteNode.name,
          mimeType: input.noteNode.mimeType,
          content: input.note.body,
        }
      : undefined,
    selection: input.selectionText
      ? {
          text: input.selectionText,
        }
      : undefined,
    appState: {
      noteId: input.note?.id ?? null,
      noteTitle: input.note?.title ?? null,
      tags: input.note?.tags ?? [],
      isPinned: input.note?.isPinned ?? false,
      filteredNoteCount: input.filteredNoteCount,
      selectedView: input.selectedView,
      selectedTag: input.selectedTag,
      query: input.query,
      selectionStart: input.selectionStart,
      selectionEnd: input.selectionEnd,
    },
  };
}
