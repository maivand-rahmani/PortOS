export type NoteItem = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
};

export const NOTES_STORAGE_KEY = "portos-notes-items";

function createTimestamp() {
  return new Date().toISOString();
}

export function createNoteItem(index: number): NoteItem {
  const timestamp = createTimestamp();

  return {
    id: crypto.randomUUID(),
    title: `Untitled note ${index + 1}`,
    body: "",
    tags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    isPinned: false,
  };
}

export function normalizeNote(note: Partial<NoteItem>, index: number): NoteItem {
  const timestamp = createTimestamp();

  return {
    id: note.id ?? crypto.randomUUID(),
    title: note.title?.trim() || `Untitled note ${index + 1}`,
    body: note.body ?? "",
    tags: Array.isArray(note.tags)
      ? note.tags.map((tag) => tag.trim()).filter(Boolean)
      : [],
    createdAt: note.createdAt ?? timestamp,
    updatedAt: note.updatedAt ?? note.createdAt ?? timestamp,
    isPinned: Boolean(note.isPinned),
  };
}

export function readStoredNotes() {
  if (typeof window === "undefined") {
    return [createNoteItem(0)];
  }

  const stored = window.localStorage.getItem(NOTES_STORAGE_KEY);

  if (!stored) {
    return [createNoteItem(0)];
  }

  try {
    const parsed = JSON.parse(stored) as Array<Partial<NoteItem>>;
    const normalized = parsed.map(normalizeNote);

    return normalized.length > 0 ? normalized : [createNoteItem(0)];
  } catch {
    return [createNoteItem(0)];
  }
}

export function saveNotes(notes: NoteItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

export function updateNoteTimestamp(note: NoteItem) {
  return {
    ...note,
    updatedAt: createTimestamp(),
  };
}

export function formatNoteDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function buildNoteExcerpt(body: string) {
  return body.trim().replace(/\s+/g, " ").slice(0, 120);
}

export function createPrefilledNote(input: {
  title: string;
  body: string;
  tags?: string[];
  pinned?: boolean;
}): NoteItem {
  const timestamp = createTimestamp();

  return {
    id: crypto.randomUUID(),
    title: input.title.trim() || "Untitled note",
    body: input.body,
    tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
    isPinned: Boolean(input.pinned),
  };
}
