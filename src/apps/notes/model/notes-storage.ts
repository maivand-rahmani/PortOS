import type { AbsolutePath } from "@/entities/file-system";
import {
  NOTES_FILE_EXTENSION,
  SYSTEM_USER_DIRECTORIES,
  subscribeToFileSystemChanges,
} from "@/shared/lib";
import {
  deleteAtPath,
  ensureDirectoryAtPath,
  getNodeAtPath,
  listPath,
  readFileAtPath,
  writeFileAtPathOrCreate,
} from "@/shared/lib/fs/fs-actions";

export type NoteItem = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  path: AbsolutePath;
};

type NoteFrontmatter = {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
};

function createTimestamp() {
  return new Date().toISOString();
}

function slugifyNoteTitle(title: string) {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "untitled-note";
}

function buildNotePath(title: string, id: string): AbsolutePath {
  return `${SYSTEM_USER_DIRECTORIES.notes}/${slugifyNoteTitle(title)}-${id.slice(0, 8)}${NOTES_FILE_EXTENSION}` as AbsolutePath;
}

function buildFrontmatter(note: Omit<NoteItem, "body" | "path">): string {
  return [
    "---",
    `id: ${note.id}`,
    `title: ${note.title.replace(/\n/g, " ")}`,
    `tags: ${JSON.stringify(note.tags)}`,
    `createdAt: ${note.createdAt}`,
    `updatedAt: ${note.updatedAt}`,
    `isPinned: ${note.isPinned ? "true" : "false"}`,
    "---",
  ].join("\n");
}

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return parsed.map((tag) => String(tag).trim()).filter(Boolean);
  } catch {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

function parseNoteContent(path: AbsolutePath, content: string, index: number): NoteItem {
  const timestamp = createTimestamp();
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontmatterLines = match?.[1]?.split("\n") ?? [];
  const body = match?.[2] ?? content;
  const metadata: Partial<NoteFrontmatter> = {};

  frontmatterLines.forEach((line) => {
    const colonIndex = line.indexOf(":");

    if (colonIndex === -1) {
      return;
    }

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    switch (key) {
      case "id":
        metadata.id = value;
        break;
      case "title":
        metadata.title = value;
        break;
      case "tags":
        metadata.tags = parseTags(value);
        break;
      case "createdAt":
        metadata.createdAt = value;
        break;
      case "updatedAt":
        metadata.updatedAt = value;
        break;
      case "isPinned":
        metadata.isPinned = value === "true";
        break;
      default:
        break;
    }
  });

  return {
    id: metadata.id ?? crypto.randomUUID(),
    title: metadata.title?.trim() || `Untitled note ${index + 1}`,
    body: body.replace(/^\n+/, ""),
    tags: metadata.tags ?? [],
    createdAt: metadata.createdAt ?? timestamp,
    updatedAt: metadata.updatedAt ?? metadata.createdAt ?? timestamp,
    isPinned: Boolean(metadata.isPinned),
    path,
  };
}

function serializeNote(note: NoteItem) {
  const metadata = buildFrontmatter({
    id: note.id,
    title: note.title.trim() || "Untitled note",
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    isPinned: note.isPinned,
  });

  return `${metadata}\n\n${note.body}`;
}

export function createNoteItem(index: number): NoteItem {
  const timestamp = createTimestamp();
  const id = crypto.randomUUID();
  const title = `Untitled note ${index + 1}`;

  return {
    id,
    title,
    body: "",
    tags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    isPinned: false,
    path: buildNotePath(title, id),
  };
}

export function normalizeNote(note: Partial<NoteItem>, index: number): NoteItem {
  const timestamp = createTimestamp();
  const id = note.id ?? crypto.randomUUID();
  const title = note.title?.trim() || `Untitled note ${index + 1}`;

  return {
    id,
    title,
    body: note.body ?? "",
    tags: Array.isArray(note.tags)
      ? note.tags.map((tag) => tag.trim()).filter(Boolean)
      : [],
    createdAt: note.createdAt ?? timestamp,
    updatedAt: note.updatedAt ?? note.createdAt ?? timestamp,
    isPinned: Boolean(note.isPinned),
    path: note.path ?? buildNotePath(title, id),
  };
}

export async function readStoredNotes() {
  await ensureDirectoryAtPath(SYSTEM_USER_DIRECTORIES.notes);

  const files = listPath(SYSTEM_USER_DIRECTORIES.notes).filter(
    (node) => node.type === "file" && node.name.endsWith(NOTES_FILE_EXTENSION),
  );

  if (files.length === 0) {
    return [createNoteItem(0)];
  }

  const notes = await Promise.all(
    files.map(async (file, index) => {
      const path = `${SYSTEM_USER_DIRECTORIES.notes}/${file.name}` as AbsolutePath;
      const content = (await readFileAtPath(path)) ?? "";

      return parseNoteContent(path, content, index);
    }),
  );

  return notes.length > 0
    ? notes.sort((left, right) => {
        if (left.isPinned !== right.isPinned) {
          return Number(right.isPinned) - Number(left.isPinned);
        }

        return right.updatedAt.localeCompare(left.updatedAt);
      })
    : [createNoteItem(0)];
}

export async function saveNotes(notes: NoteItem[]) {
  await ensureDirectoryAtPath(SYSTEM_USER_DIRECTORIES.notes);

  const existingFiles = listPath(SYSTEM_USER_DIRECTORIES.notes).filter(
    (node) => node.type === "file" && node.name.endsWith(NOTES_FILE_EXTENSION),
  );
  const nextPaths = new Set(notes.map((note) => note.path));

  await Promise.all(
    notes.map(async (note) => {
      await writeFileAtPathOrCreate(note.path, serializeNote(note));
    }),
  );

  await Promise.all(
    existingFiles
      .map((node) => `${SYSTEM_USER_DIRECTORIES.notes}/${node.name}` as AbsolutePath)
      .filter((path) => !nextPaths.has(path))
      .map((path) => deleteAtPath(path)),
  );
}

export function updateNoteTimestamp(note: NoteItem) {
  return {
    ...note,
    updatedAt: createTimestamp(),
  };
}

export function updateNotePath(note: NoteItem) {
  return {
    ...note,
    path: buildNotePath(note.title, note.id),
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

export function buildNoteChecklistProgress(body: string) {
  const checklistMatches = body.match(/^\s*- \[(?: |x|X)\].*$/gm) ?? [];

  if (checklistMatches.length === 0) {
    return null;
  }

  const completed = checklistMatches.filter((item) => /^\s*- \[(?:x|X)\]/.test(item)).length;

  return {
    total: checklistMatches.length,
    completed,
    remaining: checklistMatches.length - completed,
    percent: Math.round((completed / checklistMatches.length) * 100),
  };
}

export function duplicateNoteItem(note: NoteItem) {
  const timestamp = createTimestamp();
  const id = crypto.randomUUID();
  const title = `${note.title} copy`;

  return {
    ...note,
    id,
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    path: buildNotePath(title, id),
  };
}

export function createPrefilledNote(input: {
  title: string;
  body: string;
  tags?: string[];
  pinned?: boolean;
}): NoteItem {
  const timestamp = createTimestamp();
  const id = crypto.randomUUID();
  const title = input.title.trim() || "Untitled note";

  return {
    id,
    title,
    body: input.body,
    tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
    isPinned: Boolean(input.pinned),
    path: buildNotePath(title, id),
  };
}

export function subscribeToNotesDirectory(onChange: () => void) {
  return subscribeToFileSystemChanges((detail) => {
    if (
      detail.path?.startsWith(`${SYSTEM_USER_DIRECTORIES.notes}/`) ||
      detail.previousPath?.startsWith(`${SYSTEM_USER_DIRECTORIES.notes}/`)
    ) {
      onChange();
    }
  });
}

export function noteExistsAtPath(path: AbsolutePath) {
  return getNodeAtPath(path)?.type === "file";
}
