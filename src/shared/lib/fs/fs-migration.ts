import type { AbsolutePath } from "@/entities/file-system";

import { getMeta, setMeta } from "./idb-storage";
import {
  ensureDirectoryAtPath,
  existsAtPath,
  listPath,
  readFileAtPath,
  readJsonAtPath,
  writeFileAtPathOrCreate,
  writeJsonAtPath,
} from "./fs-actions";
import {
  LEGACY_FILE_PATHS,
  NOTES_FILE_EXTENSION,
  PERSISTED_FILE_PATHS,
  SYSTEM_USER_DIRECTORIES,
} from "./fs-paths";

// ── Migration Metadata ──────────────────────────────────

const MIGRATION_META_KEY = "fs-migration-v2";

// ── localStorage Keys ───────────────────────────────────

const LS_NOTES = "portos-notes-items";
const LS_BLOG = "portos-blog-reader-state";
const LS_CALCULATOR = "portos-calculator-tape";
const LS_AI_AGENT = "portos-ai-agent-history";
const LS_WALLPAPER = "portos-wallpaper-id";
const LS_CLOCK_FAVORITES = "portos-clock-favorites";
const LS_CLOCK_FAVORITE_ORDER = "portos-clock-favorite-order";

// ── Helpers ─────────────────────────────────────────────

function safeReadJSON<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeReadString(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

async function copyFileIfMissing(
  sourcePath: AbsolutePath,
  targetPath: AbsolutePath,
): Promise<boolean> {
  if (existsAtPath(targetPath)) {
    return false;
  }

  const content = await readFileAtPath(sourcePath);

  if (content === null) {
    return false;
  }

  await writeFileAtPathOrCreate(targetPath, content);

  return true;
}

async function copyJsonFileIfMissing<T>(
  sourcePath: AbsolutePath,
  targetPath: AbsolutePath,
): Promise<boolean> {
  if (existsAtPath(targetPath)) {
    return false;
  }

  const value = await readJsonAtPath<T>(sourcePath);

  if (value === null) {
    return false;
  }

  await writeJsonAtPath(targetPath, value);

  return true;
}

// ── Note Migration ──────────────────────────────────────

type StoredNote = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
};

function buildNoteMarkdown(note: StoredNote): string {
  const lines: string[] = [];

  lines.push(`# ${note.title}`);
  lines.push("");

  if (note.tags.length > 0) {
    lines.push(`> Tags: ${note.tags.join(", ")}`);
    lines.push("");
  }

  if (note.isPinned) {
    lines.push("> Pinned: true");
    lines.push("");
  }

  lines.push(note.body);
  lines.push("");
  lines.push(`---`);
  lines.push(`Created: ${note.createdAt}`);
  lines.push(`Updated: ${note.updatedAt}`);
  lines.push(`Original ID: ${note.id}`);

  return lines.join("\n");
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

async function migrateNotes(): Promise<number> {
  await ensureDirectoryAtPath(SYSTEM_USER_DIRECTORIES.notes);

  const canonicalNotes = listPath(SYSTEM_USER_DIRECTORIES.notes).filter(
    (node) => node.type === "file" && node.name.endsWith(NOTES_FILE_EXTENSION),
  );

  if (canonicalNotes.length > 0) {
    return 0;
  }

  const legacyNotes = listPath(LEGACY_FILE_PATHS.notesDirectory).filter(
    (node) => node.type === "file" && node.name.endsWith(NOTES_FILE_EXTENSION),
  );

  if (legacyNotes.length > 0) {
    let migrated = 0;

    for (const note of legacyNotes) {
      const sourcePath = `${LEGACY_FILE_PATHS.notesDirectory}/${note.name}` as AbsolutePath;
      const targetPath = `${SYSTEM_USER_DIRECTORIES.notes}/${note.name}` as AbsolutePath;

      if (await copyFileIfMissing(sourcePath, targetPath)) {
        migrated += 1;
      }
    }

    return migrated;
  }

  const notes = safeReadJSON<StoredNote[]>(LS_NOTES);

  if (!notes || notes.length === 0) {
    return 0;
  }

  let migrated = 0;

  for (const note of notes) {
    if (!note.id || !note.title) {
      continue;
    }

    const fileName = `${sanitizeFileName(note.title)}.md`;
    const content = buildNoteMarkdown(note);
    const targetPath = `${SYSTEM_USER_DIRECTORIES.notes}/${fileName}` as AbsolutePath;

    await writeFileAtPathOrCreate(targetPath, content);
    migrated++;
  }

  return migrated;
}

// ── Blog Migration ──────────────────────────────────────

async function migrateBlog(): Promise<boolean> {
  if (
    await copyJsonFileIfMissing<{
      queuedPostIds: string[];
      completedPostIds: string[];
      highlights: unknown[];
    }>(LEGACY_FILE_PATHS.blogReaderState, PERSISTED_FILE_PATHS.blogReaderState)
  ) {
    return true;
  }

  const state = safeReadJSON<{
    queuedPostIds: string[];
    completedPostIds: string[];
    highlights: unknown[];
  }>(LS_BLOG);

  if (!state) {
    return false;
  }

  await writeJsonAtPath(PERSISTED_FILE_PATHS.blogReaderState, state);

  return true;
}

// ── Calculator Migration ────────────────────────────────

async function migrateCalculator(): Promise<boolean> {
  if (
    await copyJsonFileIfMissing<unknown[]>(
      LEGACY_FILE_PATHS.calculatorTape,
      PERSISTED_FILE_PATHS.calculatorTape,
    )
  ) {
    return true;
  }

  const tape = safeReadJSON<unknown[]>(LS_CALCULATOR);

  if (!tape || tape.length === 0) {
    return false;
  }
  await writeJsonAtPath(PERSISTED_FILE_PATHS.calculatorTape, tape);

  return true;
}

// ── AI Agent Migration ──────────────────────────────────

async function migrateAiAgent(): Promise<boolean> {
  if (
    await copyJsonFileIfMissing<unknown[]>(
      LEGACY_FILE_PATHS.aiAgentHistory,
      PERSISTED_FILE_PATHS.aiAgentHistory,
    )
  ) {
    return true;
  }

  const history = safeReadJSON<unknown[]>(LS_AI_AGENT);

  if (!history || history.length === 0) {
    return false;
  }
  await writeJsonAtPath(PERSISTED_FILE_PATHS.aiAgentHistory, history);

  return true;
}

// ── Wallpaper Migration ─────────────────────────────────

async function migrateWallpaper(): Promise<boolean> {
  if (
    await copyJsonFileIfMissing<{ wallpaperId: string }>(
      LEGACY_FILE_PATHS.wallpaperPreferences,
      PERSISTED_FILE_PATHS.settingsWallpaper,
    )
  ) {
    return true;
  }

  const wallpaperId = safeReadString(LS_WALLPAPER);

  if (!wallpaperId) {
    return false;
  }
  await writeJsonAtPath(PERSISTED_FILE_PATHS.settingsWallpaper, { wallpaperId });

  return true;
}

// ── Clock Migration ─────────────────────────────────────

async function migrateClock(): Promise<boolean> {
  if (
    await copyJsonFileIfMissing<{
      favorites: string[];
      favoriteOrder: string[];
    }>(LEGACY_FILE_PATHS.clockPreferences, PERSISTED_FILE_PATHS.clockPreferences)
  ) {
    return true;
  }

  const favorites = safeReadJSON<string[]>(LS_CLOCK_FAVORITES);
  const order = safeReadJSON<string[]>(LS_CLOCK_FAVORITE_ORDER);

  if ((!favorites || favorites.length === 0) && (!order || order.length === 0)) {
    return false;
  }
  await writeJsonAtPath(PERSISTED_FILE_PATHS.clockPreferences, {
    favorites: favorites ?? [],
    favoriteOrder: order ?? [],
  });

  return true;
}

// ── Main Migration Runner ───────────────────────────────

export type MigrationResult = {
  alreadyMigrated: boolean;
  notesMigrated: number;
  blogMigrated: boolean;
  calculatorMigrated: boolean;
  aiAgentMigrated: boolean;
  wallpaperMigrated: boolean;
  clockMigrated: boolean;
};

export async function runDataMigration(): Promise<MigrationResult> {
  if (typeof window === "undefined") {
    return {
      alreadyMigrated: true,
      notesMigrated: 0,
      blogMigrated: false,
      calculatorMigrated: false,
      aiAgentMigrated: false,
      wallpaperMigrated: false,
      clockMigrated: false,
    };
  }

  const alreadyMigrated = await getMeta(MIGRATION_META_KEY);

  if (alreadyMigrated === true) {
    return {
      alreadyMigrated: true,
      notesMigrated: 0,
      blogMigrated: false,
      calculatorMigrated: false,
      aiAgentMigrated: false,
      wallpaperMigrated: false,
      clockMigrated: false,
    };
  }

  let notesMigrated = 0;
  let blogMigrated = false;
  let calculatorMigrated = false;
  let aiAgentMigrated = false;
  let wallpaperMigrated = false;
  let clockMigrated = false;

  try {
    notesMigrated = await migrateNotes();
  } catch (e) {
    console.warn("Notes migration failed:", e);
  }

  try {
    blogMigrated = await migrateBlog();
  } catch (e) {
    console.warn("Blog migration failed:", e);
  }

  try {
    calculatorMigrated = await migrateCalculator();
  } catch (e) {
    console.warn("Calculator migration failed:", e);
  }

  try {
    aiAgentMigrated = await migrateAiAgent();
  } catch (e) {
    console.warn("AI agent migration failed:", e);
  }

  try {
    wallpaperMigrated = await migrateWallpaper();
  } catch (e) {
    console.warn("Wallpaper migration failed:", e);
  }

  try {
    clockMigrated = await migrateClock();
  } catch (e) {
    console.warn("Clock migration failed:", e);
  }

  await setMeta(MIGRATION_META_KEY, true);

  return {
    alreadyMigrated: false,
    notesMigrated,
    blogMigrated,
    calculatorMigrated,
    aiAgentMigrated,
    wallpaperMigrated,
    clockMigrated,
  };
}
