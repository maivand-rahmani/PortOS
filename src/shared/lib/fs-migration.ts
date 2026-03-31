import { useOSStore } from "@/processes/os/model/store";
import { DEFAULT_DIR_IDS, getMeta, setMeta } from "./idb-storage";

// ── Migration Metadata ──────────────────────────────────

const MIGRATION_META_KEY = "fs-migration-v1";

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

async function createMigratedFile(
  parentDirId: string,
  name: string,
  content: string,
): Promise<void> {
  const store = useOSStore.getState();
  const file = await store.fsCreateFile(parentDirId, name, content);

  if (!file) {
    return;
  }

  // Content is already written by fsCreateFile, nothing extra needed
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

    await createMigratedFile(DEFAULT_DIR_IDS.documentsNotes, fileName, content);
    migrated++;
  }

  return migrated;
}

// ── Blog Migration ──────────────────────────────────────

async function migrateBlog(): Promise<boolean> {
  const state = safeReadJSON<{
    queuedPostIds: string[];
    completedPostIds: string[];
    highlights: unknown[];
  }>(LS_BLOG);

  if (!state) {
    return false;
  }

  const content = JSON.stringify(state, null, 2);

  await createMigratedFile(
    DEFAULT_DIR_IDS.documentsBlog,
    "reader-state.json",
    content,
  );

  return true;
}

// ── Calculator Migration ────────────────────────────────

async function migrateCalculator(): Promise<boolean> {
  const tape = safeReadJSON<unknown[]>(LS_CALCULATOR);

  if (!tape || tape.length === 0) {
    return false;
  }

  const content = JSON.stringify(tape, null, 2);

  await createMigratedFile(
    DEFAULT_DIR_IDS.documentsCalculator,
    "tape.json",
    content,
  );

  return true;
}

// ── AI Agent Migration ──────────────────────────────────

async function migrateAiAgent(): Promise<boolean> {
  const history = safeReadJSON<unknown[]>(LS_AI_AGENT);

  if (!history || history.length === 0) {
    return false;
  }

  const content = JSON.stringify(history, null, 2);

  await createMigratedFile(
    DEFAULT_DIR_IDS.systemAgent,
    "history.json",
    content,
  );

  return true;
}

// ── Wallpaper Migration ─────────────────────────────────

async function migrateWallpaper(): Promise<boolean> {
  const wallpaperId = safeReadString(LS_WALLPAPER);

  if (!wallpaperId) {
    return false;
  }

  const content = JSON.stringify({ wallpaperId }, null, 2);

  await createMigratedFile(
    DEFAULT_DIR_IDS.systemPreferences,
    "wallpaper.json",
    content,
  );

  return true;
}

// ── Clock Migration ─────────────────────────────────────

async function migrateClock(): Promise<boolean> {
  const favorites = safeReadJSON<string[]>(LS_CLOCK_FAVORITES);
  const order = safeReadJSON<string[]>(LS_CLOCK_FAVORITE_ORDER);

  if ((!favorites || favorites.length === 0) && (!order || order.length === 0)) {
    return false;
  }

  const content = JSON.stringify(
    {
      favorites: favorites ?? [],
      favoriteOrder: order ?? [],
    },
    null,
    2,
  );

  await createMigratedFile(
    DEFAULT_DIR_IDS.systemPreferences,
    "clock.json",
    content,
  );

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

  const [notesMigrated, blogMigrated, calculatorMigrated, aiAgentMigrated, wallpaperMigrated, clockMigrated] =
    await Promise.all([
      migrateNotes(),
      migrateBlog(),
      migrateCalculator(),
      migrateAiAgent(),
      migrateWallpaper(),
      migrateClock(),
    ]);

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
