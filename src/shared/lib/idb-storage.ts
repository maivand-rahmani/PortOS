import { openDB, type IDBPDatabase } from "idb";

import type {
  DirectoryNode,
  FileContent,
  FileSystemNode,
} from "@/entities/file-system";

// ── Database Schema ─────────────────────────────────────

const DB_NAME = "portos-fs";
const DB_VERSION = 1;

const STORE_NODES = "nodes";
const STORE_CONTENTS = "contents";
const STORE_METADATA = "metadata";

type PortosFSDB = {
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

// ── Singleton Connection ────────────────────────────────

let dbInstance: IDBPDatabase<PortosFSDB> | null = null;

async function getDB(): Promise<IDBPDatabase<PortosFSDB>> {
  if (dbInstance) {
    return dbInstance;
  }

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

  return db.getAll(STORE_NODES);
}

export async function getNode(
  id: string,
): Promise<FileSystemNode | undefined> {
  const db = await getDB();

  return db.get(STORE_NODES, id);
}

export async function getNodesByParent(
  parentId: string | null,
): Promise<FileSystemNode[]> {
  const db = await getDB();

  return db.getAllFromIndex(STORE_NODES, "by-parent", parentId);
}

export async function putNode(node: FileSystemNode): Promise<void> {
  const db = await getDB();

  await db.put(STORE_NODES, node);
}

export async function putNodes(nodes: FileSystemNode[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NODES, "readwrite");

  for (const node of nodes) {
    tx.store.put(node);
  }

  await tx.done;
}

export async function deleteNode(id: string): Promise<void> {
  const db = await getDB();

  await db.delete(STORE_NODES, id);
}

export async function deleteNodes(ids: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NODES, "readwrite");

  for (const id of ids) {
    tx.store.delete(id);
  }

  await tx.done;
}

// ── Content Operations ──────────────────────────────────

export async function getContent(
  nodeId: string,
): Promise<FileContent | undefined> {
  const db = await getDB();

  return db.get(STORE_CONTENTS, nodeId);
}

export async function putContent(content: FileContent): Promise<void> {
  const db = await getDB();

  await db.put(STORE_CONTENTS, content);
}

export async function deleteContent(nodeId: string): Promise<void> {
  const db = await getDB();

  await db.delete(STORE_CONTENTS, nodeId);
}

export async function deleteContents(nodeIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_CONTENTS, "readwrite");

  for (const nodeId of nodeIds) {
    tx.store.delete(nodeId);
  }

  await tx.done;
}

export async function getAllContents(): Promise<FileContent[]> {
  const db = await getDB();

  return db.getAll(STORE_CONTENTS);
}

// ── Metadata Operations ─────────────────────────────────

export async function getMeta(key: string): Promise<unknown | undefined> {
  const db = await getDB();
  const entry = await db.get(STORE_METADATA, key);

  return entry?.value;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB();

  await db.put(STORE_METADATA, { key, value });
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
    systemAgent: "dir-system-agent",
    systemPreferences: "dir-system-preferences",
    systemLogs: "dir-system-logs",
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
    makeDir("Agent", IDS.system, IDS.systemAgent, true),
    makeDir("Preferences", IDS.system, IDS.systemPreferences, true),
    makeDir("Logs", IDS.system, IDS.systemLogs, true),
    makeDir("Templates", null, IDS.templates),
  ];

  await putNodes(defaultDirs);
  await setMeta(SEED_META_KEY, true);

  return defaultDirs;
}

// ── Export / Import ─────────────────────────────────────

export async function exportAll(): Promise<{
  nodes: FileSystemNode[];
  contents: FileContent[];
}> {
  const [nodes, contents] = await Promise.all([
    getAllNodes(),
    getAllContents(),
  ]);

  return { nodes, contents };
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
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
  systemAgent: "dir-system-agent",
  systemPreferences: "dir-system-preferences",
  systemLogs: "dir-system-logs",
  templates: "dir-templates",
} as const;
