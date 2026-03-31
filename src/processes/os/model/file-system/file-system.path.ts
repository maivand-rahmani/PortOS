import type {
  AbsolutePath,
  FileSystemNode,
  FileSystemNodeMap,
  FileSystemChildMap,
  ResolvedPath,
} from "@/entities/file-system";

// ── Path Parsing ────────────────────────────────────────

export function parsePath(path: string): ResolvedPath {
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return {
      segments: [],
      parentPath: "/",
      name: "",
      isRoot: true,
    };
  }

  const segments = normalized.slice(1).split("/");
  const name = segments[segments.length - 1];
  const parentSegments = segments.slice(0, -1);
  const parentPath: AbsolutePath =
    parentSegments.length === 0
      ? "/"
      : (`/${parentSegments.join("/")}` as AbsolutePath);

  return {
    segments,
    parentPath,
    name,
    isRoot: false,
  };
}

export function normalizePath(path: string): AbsolutePath {
  if (!path || path === "/") {
    return "/";
  }

  const parts = path.split("/").filter(Boolean);
  const resolved: string[] = [];

  for (const part of parts) {
    if (part === ".") {
      continue;
    }

    if (part === "..") {
      resolved.pop();

      continue;
    }

    resolved.push(part);
  }

  if (resolved.length === 0) {
    return "/";
  }

  return `/${resolved.join("/")}` as AbsolutePath;
}

export function joinPath(base: AbsolutePath, name: string): AbsolutePath {
  if (base === "/") {
    return `/${name}` as AbsolutePath;
  }

  return `${base}/${name}` as AbsolutePath;
}

// ── Node Path Resolution ────────────────────────────────

export function getNodePath(
  nodeId: string,
  nodeMap: FileSystemNodeMap,
): AbsolutePath {
  const segments: string[] = [];
  let current: FileSystemNode | undefined = nodeMap[nodeId];

  while (current) {
    segments.unshift(current.name);

    if (!current.parentId) {
      break;
    }

    current = nodeMap[current.parentId];
  }

  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}` as AbsolutePath;
}

export function resolveNodeByPath(
  path: AbsolutePath,
  nodes: FileSystemNode[],
  nodeMap: FileSystemNodeMap,
  childMap: FileSystemChildMap,
): FileSystemNode | null {
  if (path === "/") {
    return nodes.find((n) => n.parentId === null) ?? null;
  }

  const parsed = parsePath(path);
  const roots = nodes.filter((n) => n.parentId === null);

  let current: FileSystemNode | null = null;

  for (let i = 0; i < parsed.segments.length; i++) {
    const segment = parsed.segments[i];

    if (i === 0) {
      current = roots.find((n) => n.name === segment) ?? null;
    } else if (current) {
      const childIds: string[] = childMap[current.id] ?? [];

      current =
        childIds
          .map((id: string) => nodeMap[id])
          .find((n: FileSystemNode | undefined) => n && n.name === segment) ?? null;
    }

    if (!current) {
      return null;
    }
  }

  return current;
}

// ── Ancestor Traversal ──────────────────────────────────

export function getAncestors(
  nodeId: string,
  nodeMap: FileSystemNodeMap,
): FileSystemNode[] {
  const ancestors: FileSystemNode[] = [];
  let current = nodeMap[nodeId];

  if (!current) {
    return ancestors;
  }

  let parentId = current.parentId;

  while (parentId) {
    const parent = nodeMap[parentId];

    if (!parent) {
      break;
    }

    ancestors.unshift(parent);
    parentId = parent.parentId;
  }

  return ancestors;
}

// ── Descendant Collection ───────────────────────────────

export function getDescendantIds(
  nodeId: string,
  childMap: FileSystemChildMap,
): string[] {
  const result: string[] = [];
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (currentId !== nodeId) {
      result.push(currentId);
    }

    const children = childMap[currentId] ?? [];

    queue.push(...children);
  }

  return result;
}

// ── Validation ──────────────────────────────────────────

const INVALID_NAME_CHARS = /[/\\:*?"<>|]/;
const MAX_NAME_LENGTH = 255;

export function validateNodeName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return "Name cannot be empty";
  }

  if (name.length > MAX_NAME_LENGTH) {
    return `Name cannot exceed ${MAX_NAME_LENGTH} characters`;
  }

  if (INVALID_NAME_CHARS.test(name)) {
    return "Name contains invalid characters";
  }

  if (name === "." || name === "..") {
    return "Name cannot be . or ..";
  }

  return null;
}

export function isNameTakenInParent(
  name: string,
  parentId: string | null,
  nodeMap: FileSystemNodeMap,
  childMap: FileSystemChildMap,
  excludeNodeId?: string,
): boolean {
  if (parentId === null) {
    return false;
  }

  const siblings = childMap[parentId] ?? [];

  return siblings.some((id) => {
    if (id === excludeNodeId) {
      return false;
    }

    const node = nodeMap[id];

    return node && node.name.toLowerCase() === name.toLowerCase();
  });
}

export function resolveUniqueName(
  baseName: string,
  parentId: string | null,
  nodeMap: FileSystemNodeMap,
  childMap: FileSystemChildMap,
  excludeNodeId?: string,
): string {
  if (
    !isNameTakenInParent(baseName, parentId, nodeMap, childMap, excludeNodeId)
  ) {
    return baseName;
  }

  const dotIndex = baseName.lastIndexOf(".");
  const stem = dotIndex > 0 ? baseName.slice(0, dotIndex) : baseName;
  const ext = dotIndex > 0 ? baseName.slice(dotIndex) : "";

  let counter = 1;
  let candidate = `${stem} ${counter}${ext}`;

  while (
    isNameTakenInParent(candidate, parentId, nodeMap, childMap, excludeNodeId)
  ) {
    counter++;
    candidate = `${stem} ${counter}${ext}`;
  }

  return candidate;
}
