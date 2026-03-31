import type { AbsolutePath, FileNode } from "@/entities/file-system";

// ── Editor Mode ─────────────────────────────────────────

export type EditorMode = "plaintext" | "markdown" | "json" | "code";

// ── Editor Document ─────────────────────────────────────

export type EditorDocument = {
  nodeId: string;
  path: AbsolutePath;
  name: string;
  extension: string;
  mode: EditorMode;
  content: string;
  savedContent: string;
  version: number;
};

// ── Undo / Redo ─────────────────────────────────────────

export type UndoEntry = {
  content: string;
  timestamp: number;
};

// ── Editor State ────────────────────────────────────────

export type EditorState = {
  document: EditorDocument | null;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
  showPreview: boolean;
  wordCount: number;
  lineCount: number;
  charCount: number;
  autoSaveEnabled: boolean;
  lastSavedAt: string | null;
  error: string | null;
};

// ── Mode Detection ──────────────────────────────────────

const MODE_MAP: Record<string, EditorMode> = {
  txt: "plaintext",
  md: "markdown",
  json: "json",
  csv: "plaintext",
  html: "code",
  css: "code",
  ts: "code",
  tsx: "code",
  js: "code",
  jsx: "code",
};

export function detectEditorMode(extension: string): EditorMode {
  return MODE_MAP[extension.toLowerCase()] ?? "plaintext";
}

// ── Text Statistics ─────────────────────────────────────

export function computeTextStats(content: string): {
  wordCount: number;
  lineCount: number;
  charCount: number;
} {
  const charCount = content.length;
  const lineCount = content === "" ? 1 : content.split("\n").length;
  const trimmed = content.trim();
  const wordCount = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

  return { wordCount, lineCount, charCount };
}

// ── Document Factory ────────────────────────────────────

export function createEditorDocument(
  node: FileNode,
  path: AbsolutePath,
  content: string,
): EditorDocument {
  return {
    nodeId: node.id,
    path,
    name: node.name,
    extension: node.extension,
    mode: detectEditorMode(node.extension),
    content,
    savedContent: content,
    version: node.version,
  };
}

// ── Initial State ───────────────────────────────────────

export const INITIAL_EDITOR_STATE: EditorState = {
  document: null,
  isLoading: false,
  isSaving: false,
  isDirty: false,
  undoStack: [],
  redoStack: [],
  showPreview: false,
  wordCount: 0,
  lineCount: 1,
  charCount: 0,
  autoSaveEnabled: true,
  lastSavedAt: null,
  error: null,
};

// ── Undo Constants ──────────────────────────────────────

export const MAX_UNDO_STACK = 100;
export const UNDO_DEBOUNCE_MS = 500;
export const AUTO_SAVE_DELAY_MS = 3000;
