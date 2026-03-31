// ── Node Types ──────────────────────────────────────────

export type FileSystemNodeType = "file" | "directory";

export type FileSystemNodeBase = {
  id: string;
  name: string;
  type: FileSystemNodeType;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  isHidden: boolean;
};

export type FileNode = FileSystemNodeBase & {
  type: "file";
  extension: string;
  mimeType: string;
  size: number;
  version: number;
};

export type DirectoryNode = FileSystemNodeBase & {
  type: "directory";
};

export type FileSystemNode = FileNode | DirectoryNode;

// ── Content (stored separately in IndexedDB) ───────────

export type FileContent = {
  nodeId: string;
  data: string;
  encoding: "utf-8";
  checksum: string;
};

// ── Path Types ──────────────────────────────────────────

export type AbsolutePath = `/${string}` | "/";

export type ResolvedPath = {
  segments: string[];
  parentPath: AbsolutePath;
  name: string;
  isRoot: boolean;
};

// ── Search ──────────────────────────────────────────────

export type FileSearchMatchType = "name" | "content" | "extension";

export type FileSearchResult = {
  node: FileSystemNode;
  path: AbsolutePath;
  matchType: FileSearchMatchType;
  snippet?: string;
};

// ── Clipboard ───────────────────────────────────────────

export type FileClipboardOperation = "copy" | "cut";

export type FileClipboard = {
  nodeIds: string[];
  operation: FileClipboardOperation;
};

// ── MIME Map ────────────────────────────────────────────

export const SUPPORTED_MIME_MAP: Record<string, string> = {
  txt: "text/plain",
  md: "text/markdown",
  json: "application/json",
  csv: "text/csv",
  html: "text/html",
  css: "text/css",
  ts: "text/typescript",
  tsx: "text/typescript",
  js: "text/javascript",
  jsx: "text/javascript",
};

export const DEFAULT_MIME_TYPE = "application/octet-stream";

// ── Helpers ─────────────────────────────────────────────

export function getMimeType(extension: string): string {
  return SUPPORTED_MIME_MAP[extension.toLowerCase()] ?? DEFAULT_MIME_TYPE;
}

export function getExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");

  if (dotIndex <= 0) {
    return "";
  }

  return name.slice(dotIndex + 1).toLowerCase();
}

export function isTextMime(mimeType: string): boolean {
  return (
    mimeType.startsWith("text/") || mimeType === "application/json"
  );
}

// ── Node Map Types ──────────────────────────────────────

export type FileSystemNodeMap = Record<string, FileSystemNode>;
export type FileSystemChildMap = Record<string, string[]>;
