import type { NotesExternalRequestDetail } from "@/shared/lib/os-events/notes-os-events";

export type { NotesExternalRequestDetail } from "@/shared/lib/os-events/notes-os-events";

import { createPrefilledNote, type NoteItem } from "./notes-storage";

function mergeTags(current: string[], incoming: string[]) {
  return Array.from(new Set([...current, ...incoming].map((tag) => tag.trim()).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right),
  );
}

function matchesRequest(note: NoteItem, request: NotesExternalRequestDetail) {
  if (request.id) {
    return note.id === request.id;
  }

  return note.title.trim().toLowerCase() === request.title.trim().toLowerCase();
}

export function applyNotesExternalRequest(notes: NoteItem[], request: NotesExternalRequestDetail) {
  const normalizedBody = request.body ?? "";
  const normalizedTags = request.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [];
  const mode = request.mode ?? "create";

  if (mode === "upsert") {
    const existingNote = notes.find((note) => matchesRequest(note, request));

    if (existingNote) {
      const nextNote: NoteItem = {
        ...existingNote,
        title: request.title.trim() || existingNote.title,
        body: normalizedBody ? [existingNote.body, normalizedBody].filter(Boolean).join("\n\n") : existingNote.body,
        tags: mergeTags(existingNote.tags, normalizedTags),
        isPinned: request.pinned ?? existingNote.isPinned,
        updatedAt: new Date().toISOString(),
      };

      return {
        note: nextNote,
        notes: notes.map((note) => (note.id === existingNote.id ? nextNote : note)),
      };
    }
  }

  const created = createPrefilledNote({
    title: request.title,
    body: normalizedBody,
    tags: normalizedTags,
    pinned: request.pinned,
  });

  return {
    note: created,
    notes: [created, ...notes],
  };
}
