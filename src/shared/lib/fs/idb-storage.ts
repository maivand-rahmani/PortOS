import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction } from "idb";

import type {
  DirectoryNode,
  FileContent,
  FileNode,
  FileSystemNode,
} from "@/entities/file-system";
import { getExtension, getMimeType, type AbsolutePath } from "@/entities/file-system";
import {
  buildChildMap,
  buildNodeMap,
  normalizePath,
  resolveNodeByPath,
} from "@/processes/os/model/file-system";

// ── Database Schema ─────────────────────────────────────

const DB_NAME = "portos-fs";
const DB_VERSION = 1;

const STORE_NODES = "nodes";
const STORE_CONTENTS = "contents";
const STORE_METADATA = "metadata";

type PortosFSDB = DBSchema & {
  nodes: {
    key: string;
    value: FileSystemNode;
    indexes: {
      "by-parent": string | null;
      "by-type": string;
      "by-updated": string;
    };
  };
  contents: {
    key: string;
    value: FileContent;
  };
  metadata: {
    key: string;
    value: { key: string; value: unknown };
  };
};

// ── In-Memory Fallback ──────────────────────────────────

let isFallbackMode = false;

const fallbackNodes = new Map<string, FileSystemNode>();
const fallbackContents = new Map<string, FileContent>();
const fallbackMeta = new Map<string, unknown>();

export function isUsingFallback(): boolean {
  return isFallbackMode;
}

function getFallbackNodes(): FileSystemNode[] {
  return [...fallbackNodes.values()];
}

// ── Cross-Tab Sync (BroadcastChannel) ───────────────────
const SYNC_CHANNEL = "portos-idb-sync";

let syncChannel: BroadcastChannel | null = null;

function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel(SYNC_CHANNEL);
    } catch {
      return null;
    }
  }
  return syncChannel;
}

export function setupCrossTabSync() {
  const channel = getSyncChannel();
  if (!channel) return;

  channel.onmessage = (event) => {
    const msg = event.data as { type: string; store: string; timestamp: number };
    if (msg?.type === "write") {
      console.warn(`[IDB Sync] Another tab modified ${msg.store} at ${new Date(msg.timestamp).toISOString()}`);
    }
  };
}

function broadcastWrite(storeName: string) {
  const channel = getSyncChannel();
  if (!channel) return;
  channel.postMessage({ type: "write", store: storeName, timestamp: Date.now() });
}

// ── Singleton Connection ────────────────────────────────

let dbInstance: IDBPDatabase<PortosFSDB> | null = null;

async function getDB(): Promise<IDBPDatabase<PortosFSDB> | null> {
  if (isFallbackMode) {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB<PortosFSDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Nodes store
        if (!db.objectStoreNames.contains(STORE_NODES)) {
          const nodeStore = db.createObjectStore(STORE_NODES, {
            keyPath: "id",
          });

          nodeStore.createIndex("by-parent", "parentId");
          nodeStore.createIndex("by-type", "type");
          nodeStore.createIndex("by-updated", "updatedAt");
        }

        // Contents store
        if (!db.objectStoreNames.contains(STORE_CONTENTS)) {
          db.createObjectStore(STORE_CONTENTS, {
            keyPath: "nodeId",
          });
        }

        // Metadata store
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, {
            keyPath: "key",
          });
        }
      },
    });

    return dbInstance;
  } catch (error) {
    console.warn("IndexedDB unavailable, using in-memory fallback:", error);
    isFallbackMode = true;
    return null;
  }
}

// ── Checksum ────────────────────────────────────────────

export function computeChecksum(data: string): string {
  let hash = 0;

  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);

    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  return hash.toString(36);
}

// ── Node Operations ─────────────────────────────────────

export async function getAllNodes(): Promise<FileSystemNode[]> {
  const db = await getDB();

  if (!db) {
    return getFallbackNodes();
  }

  return db.getAll(STORE_NODES);
}

export async function getNode(
  id: string,
): Promise<FileSystemNode | undefined> {
  const db = await getDB();

  if (!db) {
    return fallbackNodes.get(id);
  }

  return db.get(STORE_NODES, id);
}

export async function getNodesByParent(
  parentId: string | null,
): Promise<FileSystemNode[]> {
  const db = await getDB();

  if (!db) {
    return getFallbackNodes().filter((node) => node.parentId === parentId);
  }

  return db.getAllFromIndex(STORE_NODES, "by-parent", parentId);
}

export async function putNode(node: FileSystemNode): Promise<void> {
  const db = await getDB();

  if (!db) {
    fallbackNodes.set(node.id, node);
    return;
  }

  await db.put(STORE_NODES, node);
  broadcastWrite(STORE_NODES);
}

export async function putNodeAndContent(
  node: FileSystemNode,
  content?: FileContent,
): Promise<void> {
  const db = await getDB();

  if (!db) {
    fallbackNodes.set(node.id, node);

    if (content) {
      fallbackContents.set(content.nodeId, content);
    }

    return;
  }

  const tx = db.transaction([STORE_NODES, STORE_CONTENTS], "readwrite");

  await tx.objectStore(STORE_NODES).put(node);

  if (content) {
    await tx.objectStore(STORE_CONTENTS).put(content);
  }

  await tx.done;
  broadcastWrite("nodes+contents");
}

export async function putNodes(nodes: FileSystemNode[]): Promise<void> {
  const db = await getDB();

  if (!db) {
    for (const node of nodes) {
      fallbackNodes.set(node.id, node);
    }

    return;
  }

  const tx = db.transaction(STORE_NODES, "readwrite");

  for (const node of nodes) {
    tx.store.put(node);
  }

  await tx.done;
  broadcastWrite(STORE_NODES);
}

export async function deleteNode(id: string): Promise<void> {
  const db = await getDB();

  if (!db) {
    fallbackNodes.delete(id);
    return;
  }

  await db.delete(STORE_NODES, id);
  broadcastWrite(STORE_NODES);
}

export async function deleteNodeAndContents(nodeIds: string[]): Promise<void> {
  const db = await getDB();

  if (!db) {
    for (const id of nodeIds) {
      fallbackNodes.delete(id);
      fallbackContents.delete(id);
    }
    return;
  }

  const tx = db.transaction([STORE_NODES, STORE_CONTENTS], "readwrite");

  for (const id of nodeIds) {
    await tx.objectStore(STORE_NODES).delete(id);
  }

  for (const id of nodeIds) {
    await tx.objectStore(STORE_CONTENTS).delete(id);
  }

  await tx.done;
  broadcastWrite("nodes+contents");
}

export async function deleteNodes(ids: string[]): Promise<void> {
  const db = await getDB();

  if (!db) {
    for (const id of ids) {
      fallbackNodes.delete(id);
    }

    return;
  }

  const tx = db.transaction(STORE_NODES, "readwrite");

  for (const id of ids) {
    tx.store.delete(id);
  }

  await tx.done;
  broadcastWrite(STORE_NODES);
}

// ── Content Operations ──────────────────────────────────

export async function getContent(
  nodeId: string,
): Promise<FileContent | undefined> {
  const db = await getDB();

  if (!db) {
    return fallbackContents.get(nodeId);
  }

  return db.get(STORE_CONTENTS, nodeId);
}

export async function putContent(content: FileContent): Promise<void> {
  const db = await getDB();

  if (!db) {
    fallbackContents.set(content.nodeId, content);
    return;
  }

  await db.put(STORE_CONTENTS, content);
  broadcastWrite(STORE_CONTENTS);
}

export async function putContents(contents: FileContent[]): Promise<void> {
  const db = await getDB();

  if (!db) {
    for (const content of contents) {
      fallbackContents.set(content.nodeId, content);
    }

    return;
  }

  const tx = db.transaction(STORE_CONTENTS, "readwrite");

  for (const content of contents) {
    tx.store.put(content);
  }

  await tx.done;
  broadcastWrite(STORE_CONTENTS);
}

export async function putNodeContentAndMeta(input: {
  node?: FileSystemNode;
  content?: FileContent;
  metadata?: Array<{ key: string; value: unknown }>;
}): Promise<void> {
  const db = await getDB();

  if (!db) {
    if (input.node) {
      fallbackNodes.set(input.node.id, input.node);
    }

    if (input.content) {
      fallbackContents.set(input.content.nodeId, input.content);
    }

    if (input.metadata) {
      for (const entry of input.metadata) {
        fallbackMeta.set(entry.key, entry.value);
      }
    }

    return;
  }

  const tx = db.transaction(
    [STORE_NODES, STORE_CONTENTS, STORE_METADATA],
    "readwrite",
  );

  if (input.node) {
    await tx.objectStore(STORE_NODES).put(input.node);
  }

  if (input.content) {
    await tx.objectStore(STORE_CONTENTS).put(input.content);
  }

  if (input.metadata) {
    for (const entry of input.metadata) {
      await tx.objectStore(STORE_METADATA).put(entry);
    }
  }

  await tx.done;
  broadcastWrite("nodes+contents+meta");
}

function splitPath(path: AbsolutePath) {
  const normalized = normalizePath(path);
  const parentPath = normalized.slice(0, normalized.lastIndexOf("/")) || "/";
  const name = normalized.slice(normalized.lastIndexOf("/") + 1);

  return {
    normalized,
    parentPath: parentPath as AbsolutePath,
    name,
  };
}

function findRootByName(nodes: FileSystemNode[], name: string) {
  return nodes.find((node) => node.parentId === null && node.name === name) ?? null;
}

export async function readJsonFile<T>(path: AbsolutePath): Promise<T | null> {
  const nodes = await getAllNodes();
  const nodeMap = buildNodeMap(nodes);
  const childMap = buildChildMap(nodes);
  const node = resolveNodeByPath(normalizePath(path), nodes, nodeMap, childMap);

  if (!node || node.type !== "file") {
    return null;
  }

  const content = await getContent(node.id);

  if (!content?.data) {
    return null;
  }

  try {
    return JSON.parse(content.data) as T;
  } catch {
    return null;
  }
}

async function ensureDirectoryTreeInTx(
  tx: IDBPTransaction<PortosFSDB, [typeof STORE_NODES, typeof STORE_CONTENTS], "readwrite">,
  path: AbsolutePath,
): Promise<DirectoryNode | null> {
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return null;
  }

  const nodes = (await tx.objectStore(STORE_NODES).getAll()) as FileSystemNode[];
  const nodeMap = buildNodeMap(nodes);
  const childMap = buildChildMap(nodes);
  const segments = normalized.split("/").filter(Boolean);
  const now = new Date().toISOString();
  let current = findRootByName(nodes, segments[0]);

  if (!current) {
    current = {
      id: crypto.randomUUID(),
      name: segments[0],
      type: "directory",
      parentId: null,
      createdAt: now,
      updatedAt: now,
      isHidden: segments[0].startsWith("."),
    };
    await tx.objectStore(STORE_NODES).put(current);
    nodes.push(current);
    nodeMap[current.id] = current;
    childMap.__root__ = [...(childMap.__root__ ?? []), current.id];
  }

  for (let index = 1; index < segments.length; index += 1) {
    const segment = segments[index];
    const childIds: string[] = childMap[current.id] ?? [];
    const existing = childIds
      .map((id) => nodeMap[id])
      .find((node) => node?.name === segment) ?? null;

    if (existing) {
      if (existing.type !== "directory") {
        return null;
      }

      current = existing;
      continue;
    }

    const nextDirectory: DirectoryNode = {
      id: crypto.randomUUID(),
      name: segment,
      type: "directory",
      parentId: current.id,
      createdAt: now,
      updatedAt: now,
      isHidden: segment.startsWith("."),
    };
    await tx.objectStore(STORE_NODES).put(nextDirectory);
    nodes.push(nextDirectory);
    nodeMap[nextDirectory.id] = nextDirectory;
    childMap[current.id] = [...(childMap[current.id] ?? []), nextDirectory.id];
    current = nextDirectory;
  }

  return current as DirectoryNode;
}

export async function writeJsonFile(path: AbsolutePath, value: unknown): Promise<void> {
  const db = await getDB();
  const content = JSON.stringify(value, null, 2);
  const { normalized, parentPath, name } = splitPath(path);

  if (!db) {
    const allNodes = getFallbackNodes();
    const nodeMap = buildNodeMap(allNodes);
    const childMap = buildChildMap(allNodes);
    const existing = resolveNodeByPath(normalized, allNodes, nodeMap, childMap);

    if (existing && existing.type === "file") {
      const updatedNode: FileNode = {
        ...existing,
        updatedAt: new Date().toISOString(),
        size: new Blob([content]).size,
        version: existing.version + 1,
      };
      fallbackNodes.set(existing.id, updatedNode);
      fallbackContents.set(existing.id, {
        nodeId: existing.id,
        data: content,
        encoding: "utf-8",
        checksum: computeChecksum(content),
      });
    }

    return;
  }

  const tx = db.transaction([STORE_NODES, STORE_CONTENTS], "readwrite");
  const parent = await ensureDirectoryTreeInTx(tx, parentPath);

  if (!parent) {
    await tx.done;
    return;
  }

  const nodes = (await tx.objectStore(STORE_NODES).getAll()) as FileSystemNode[];
  const nodeMap = buildNodeMap(nodes);
  const childMap = buildChildMap(nodes);
  const existing = resolveNodeByPath(normalized, nodes, nodeMap, childMap);

  if (existing && existing.type === "file") {
    const updatedNode: FileNode = {
      ...existing,
      updatedAt: new Date().toISOString(),
      size: new Blob([content]).size,
      version: existing.version + 1,
    };

    await tx.objectStore(STORE_NODES).put(updatedNode);
    await tx.objectStore(STORE_CONTENTS).put({
      nodeId: existing.id,
      data: content,
      encoding: "utf-8",
      checksum: computeChecksum(content),
    });
    await tx.done;
    broadcastWrite(STORE_NODES);
    return;
  }

  const now = new Date().toISOString();
  const extension = getExtension(name);
  const node: FileNode = {
    id: crypto.randomUUID(),
    name,
    type: "file",
    parentId: parent.id,
    createdAt: now,
    updatedAt: now,
    isHidden: name.startsWith("."),
    extension,
    mimeType: getMimeType(extension),
    size: new Blob([content]).size,
    version: 1,
  };

  await tx.objectStore(STORE_NODES).put(node);
  await tx.objectStore(STORE_CONTENTS).put({
    nodeId: node.id,
    data: content,
    encoding: "utf-8",
    checksum: computeChecksum(content),
  });
  await tx.done;
  broadcastWrite(STORE_NODES);
}

export async function deleteContent(nodeId: string): Promise<void> {
  const db = await getDB();

  if (!db) {
    fallbackContents.delete(nodeId);
    return;
  }

  await db.delete(STORE_CONTENTS, nodeId);
  broadcastWrite(STORE_CONTENTS);
}

export async function deleteContents(nodeIds: string[]): Promise<void> {
  const db = await getDB();

  if (!db) {
    for (const nodeId of nodeIds) {
      fallbackContents.delete(nodeId);
    }

    return;
  }

  const tx = db.transaction(STORE_CONTENTS, "readwrite");

  for (const nodeId of nodeIds) {
    tx.store.delete(nodeId);
  }

  await tx.done;
  broadcastWrite(STORE_CONTENTS);
}

export async function getAllContents(): Promise<FileContent[]> {
  const db = await getDB();

  if (!db) {
    return [...fallbackContents.values()];
  }

  return db.getAll(STORE_CONTENTS);
}

// ── Metadata Operations ─────────────────────────────────

export async function getMeta(key: string): Promise<unknown | undefined> {
  const db = await getDB();

  if (!db) {
    return fallbackMeta.get(key);
  }

  const entry = await db.get(STORE_METADATA, key);

  return entry?.value;
}

export async function getAllMeta(): Promise<Array<{ key: string; value: unknown }>> {
  const db = await getDB();

  if (!db) {
    return [...fallbackMeta.entries()].map(([key, value]) => ({ key, value }));
  }

  return db.getAll(STORE_METADATA);
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB();

  if (!db) {
    fallbackMeta.set(key, value);
    return;
  }

  await db.put(STORE_METADATA, { key, value });
  broadcastWrite(STORE_METADATA);
}

// ── Seeding ─────────────────────────────────────────────

const SEED_META_KEY = "fs-seeded";

export async function isSeeded(): Promise<boolean> {
  const value = await getMeta(SEED_META_KEY);

  return value === true;
}

export async function seedDefaultFileSystem(): Promise<FileSystemNode[]> {
  const alreadySeeded = await isSeeded();

  if (alreadySeeded) {
    return getAllNodes();
  }

  const now = new Date().toISOString();

  function makeDir(
    name: string,
    parentId: string | null,
    id: string,
    hidden = false,
  ): DirectoryNode {
    return {
      id,
      name,
      type: "directory",
      parentId,
      createdAt: now,
      updatedAt: now,
      isHidden: hidden,
    };
  }

  // Stable IDs for default directories
  const IDS = {
    desktop: "dir-desktop",
    documents: "dir-documents",
    documentsNotes: "dir-documents-notes",
    documentsBlog: "dir-documents-blog",
    documentsCalculator: "dir-documents-calculator",
    downloads: "dir-downloads",
    system: "dir-system",
    systemApps: "dir-system-apps",
    systemAgent: "dir-system-agent",
    systemUser: "dir-system-user",
    systemShared: "dir-system-shared",
    systemCache: "dir-system-cache",
    systemPreferences: "dir-system-preferences",
    systemLogs: "dir-system-logs",
    systemAppsAiAgent: "dir-system-apps-ai-agent",
    systemAppsBlog: "dir-system-apps-blog",
    systemAppsCalculator: "dir-system-apps-calculator",
    systemAppsClock: "dir-system-apps-clock",
    systemAppsSettings: "dir-system-apps-settings",
    systemAppsTerminal: "dir-system-apps-terminal",
    systemAppsSystemInfo: "dir-system-apps-system-info",
    systemUserAi: "dir-system-user-ai",
    systemUserAiTranscripts: "dir-system-user-ai-transcripts",
    systemUserBlog: "dir-system-user-blog",
    systemUserCalculator: "dir-system-user-calculator",
    systemUserContact: "dir-system-user-contact",
    systemUserDocs: "dir-system-user-docs",
    systemUserNotes: "dir-system-user-notes",
    systemUserPortfolio: "dir-system-user-portfolio",
    systemUserResume: "dir-system-user-resume",
    systemUserWallpapers: "dir-system-user-wallpapers",
    systemSharedSession: "dir-system-shared-session",
    systemSharedRegistry: "dir-system-shared-registry",
    systemSharedRecent: "dir-system-shared-recent",
    systemCachePreviews: "dir-system-cache-previews",
    systemCacheSearch: "dir-system-cache-search",
    templates: "dir-templates",
  } as const;

  const defaultDirs: DirectoryNode[] = [
    makeDir("Desktop", null, IDS.desktop),
    makeDir("Documents", null, IDS.documents),
    makeDir("Notes", IDS.documents, IDS.documentsNotes),
    makeDir("Blog", IDS.documents, IDS.documentsBlog),
    makeDir("Calculator", IDS.documents, IDS.documentsCalculator),
    makeDir("Downloads", null, IDS.downloads),
    makeDir("System", null, IDS.system, true),
    makeDir("apps", IDS.system, IDS.systemApps, true),
    makeDir("Agent", IDS.system, IDS.systemAgent, true),
    makeDir("user", IDS.system, IDS.systemUser, true),
    makeDir("shared", IDS.system, IDS.systemShared, true),
    makeDir("cache", IDS.system, IDS.systemCache, true),
    makeDir("Preferences", IDS.system, IDS.systemPreferences, true),
    makeDir("Logs", IDS.system, IDS.systemLogs, true),
    makeDir("ai-agent", IDS.systemApps, IDS.systemAppsAiAgent, true),
    makeDir("blog", IDS.systemApps, IDS.systemAppsBlog, true),
    makeDir("calculator", IDS.systemApps, IDS.systemAppsCalculator, true),
    makeDir("clock", IDS.systemApps, IDS.systemAppsClock, true),
    makeDir("settings", IDS.systemApps, IDS.systemAppsSettings, true),
    makeDir("system-info", IDS.systemApps, IDS.systemAppsSystemInfo, true),
    makeDir("terminal", IDS.systemApps, IDS.systemAppsTerminal, true),
    makeDir("ai", IDS.systemUser, IDS.systemUserAi, true),
    makeDir("transcripts", IDS.systemUserAi, IDS.systemUserAiTranscripts, true),
    makeDir("blog", IDS.systemUser, IDS.systemUserBlog, true),
    makeDir("calculator", IDS.systemUser, IDS.systemUserCalculator, true),
    makeDir("contact", IDS.systemUser, IDS.systemUserContact, true),
    makeDir("docs", IDS.systemUser, IDS.systemUserDocs, true),
    makeDir("notes", IDS.systemUser, IDS.systemUserNotes, true),
    makeDir("portfolio", IDS.systemUser, IDS.systemUserPortfolio, true),
    makeDir("resume", IDS.systemUser, IDS.systemUserResume, true),
    makeDir("wallpapers", IDS.systemUser, IDS.systemUserWallpapers, true),
    makeDir("session", IDS.systemShared, IDS.systemSharedSession, true),
    makeDir("registry", IDS.systemShared, IDS.systemSharedRegistry, true),
    makeDir("recent", IDS.systemShared, IDS.systemSharedRecent, true),
    makeDir("previews", IDS.systemCache, IDS.systemCachePreviews, true),
    makeDir("search", IDS.systemCache, IDS.systemCacheSearch, true),
    makeDir("Templates", null, IDS.templates),
  ];

  await putNodes(defaultDirs);
  broadcastWrite(STORE_NODES);
  await setMeta(SEED_META_KEY, true);

  return defaultDirs;
}

// ── Export / Import ─────────────────────────────────────

export async function exportAll(): Promise<{
  nodes: FileSystemNode[];
  contents: FileContent[];
  metadata: Array<{ key: string; value: unknown }>;
}> {
  const [nodes, contents, metadata] = await Promise.all([
    getAllNodes(),
    getAllContents(),
    getAllMeta(),
  ]);

  return { nodes, contents, metadata };
}

export async function clearAll(): Promise<void> {
  const db = await getDB();

  if (!db) {
    fallbackNodes.clear();
    fallbackContents.clear();
    fallbackMeta.clear();
    return;
  }

  const tx = db.transaction(
    [STORE_NODES, STORE_CONTENTS, STORE_METADATA],
    "readwrite",
  );

  await Promise.all([
    tx.objectStore(STORE_NODES).clear(),
    tx.objectStore(STORE_CONTENTS).clear(),
    tx.objectStore(STORE_METADATA).clear(),
    tx.done,
  ]);
  broadcastWrite("all");
}

// ── Default Directory IDs (for app migration) ───────────

export const DEFAULT_DIR_IDS = {
  desktop: "dir-desktop",
  documents: "dir-documents",
  documentsNotes: "dir-documents-notes",
  documentsBlog: "dir-documents-blog",
  documentsCalculator: "dir-documents-calculator",
  downloads: "dir-downloads",
  system: "dir-system",
  systemApps: "dir-system-apps",
  systemAgent: "dir-system-agent",
  systemUser: "dir-system-user",
  systemShared: "dir-system-shared",
  systemCache: "dir-system-cache",
  systemPreferences: "dir-system-preferences",
  systemLogs: "dir-system-logs",
  systemAppsAiAgent: "dir-system-apps-ai-agent",
  systemAppsBlog: "dir-system-apps-blog",
  systemAppsCalculator: "dir-system-apps-calculator",
  systemAppsClock: "dir-system-apps-clock",
  systemAppsSettings: "dir-system-apps-settings",
  systemAppsTerminal: "dir-system-apps-terminal",
  systemAppsSystemInfo: "dir-system-apps-system-info",
  systemUserAi: "dir-system-user-ai",
  systemUserBlog: "dir-system-user-blog",
  systemUserCalculator: "dir-system-user-calculator",
  systemUserContact: "dir-system-user-contact",
  systemUserDocs: "dir-system-user-docs",
  systemUserNotes: "dir-system-user-notes",
  systemUserPortfolio: "dir-system-user-portfolio",
  systemUserResume: "dir-system-user-resume",
  systemUserWallpapers: "dir-system-user-wallpapers",
  systemSharedSession: "dir-system-shared-session",
  systemSharedRegistry: "dir-system-shared-registry",
  systemSharedRecent: "dir-system-shared-recent",
  systemCachePreviews: "dir-system-cache-previews",
  systemCacheSearch: "dir-system-cache-search",
  templates: "dir-templates",
} as const;
