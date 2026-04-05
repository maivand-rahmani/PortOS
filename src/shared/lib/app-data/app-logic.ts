import type { AbsolutePath, FileSystemNode } from "@/entities/file-system";

import {
  listPath,
  existsAtPath,
  getNodeAtPath,
  readFileAtPath,
  createFileAtPath,
  createDirectoryAtPath,
  deleteAtPath,
  moveToPath,
  copyToPath,
} from "../fs/fs-actions";
import { getProfileBasics } from "./project-data";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  tags: string[];
};

export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
};

export type TerminalResult = {
  output: string[];
  openAppId?: string;
  nextPath?: string;
  clear?: boolean;
  windowAction?: TerminalWindowAction;
  processAction?: TerminalProcessAction;
};

type TerminalAppInfo = {
  id: string;
  name: string;
  description?: string;
};

type RuntimeSnapshot = {
  apps: Array<{ id: string; name: string }>;
  processes: Array<{ id: string; appId: string; name: string; startedAt: number }>;
  windows: Array<{
    id: string;
    appId: string;
    title: string;
    processId: string;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
  }>;
  activeWindowId: string | null;
  bootPhase: string;
  bootProgress: number;
};

export type TerminalWindowActionType = "focus" | "close" | "minimize" | "maximize" | "restore";

export type TerminalWindowAction = {
  type: TerminalWindowActionType;
  targetWindowId: string;
};

export type TerminalProcessAction = {
  type: "terminate";
  targetProcessId: string;
};

type TerminalContext = {
  runtime?: RuntimeSnapshot;
};

export function calculateExpression(expression: string) {
  const safeExpression = expression.replace(/[^0-9+\-*/().%\s]/g, "");

  if (!safeExpression.trim()) {
    return "0";
  }

  const normalized = safeExpression.replace(/%/g, "/100");
  const result = Function(`"use strict"; return (${normalized});`)();

  if (typeof result !== "number" || Number.isNaN(result) || !Number.isFinite(result)) {
    throw new Error("Invalid calculation");
  }

  return Number.isInteger(result) ? String(result) : result.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

export function buildFormattedWorldClockTime(timeZone: string, use24Hour: boolean, value: number | Date = Date.now()) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !use24Hour,
    timeZone,
  }).format(value instanceof Date ? value : new Date(value));
}

export const blogPosts: BlogPost[] = [
  {
    id: "browser-os-interfaces",
    title: "Why portfolio interfaces should feel like products",
    excerpt: "A portfolio earns attention faster when it behaves like a system instead of a brochure.",
    body: "Interactive portfolio systems create better memory, stronger navigation, and more honest demonstrations of frontend ability.",
    publishedAt: "2026-03-20",
    tags: ["portfolio", "product", "frontend"],
  },
  {
    id: "window-systems-on-web",
    title: "Designing browser windows that feel intentional",
    excerpt: "Window interactions need tuned motion, not just drag handlers.",
    body: "A believable OS-like interface depends on focus, resize, depth, and state continuity more than chrome alone.",
    publishedAt: "2026-03-18",
    tags: ["ux", "windows", "motion"],
  },
];

export function validateContactSubmission(payload: ContactSubmission) {
  if (!payload.name.trim() || !payload.email.trim() || !payload.message.trim()) {
    throw new Error("All contact fields are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw new Error("Enter a valid email address.");
  }

  if (payload.message.trim().length < 10) {
    throw new Error("Message must be at least 10 characters.");
  }

  return {
    ok: true,
    submittedAt: new Date().toISOString(),
  };
}

function normalizeTerminalPath(currentPath: string, targetPath: string) {
  const segments = (targetPath.startsWith("/") ? targetPath : `${currentPath}/${targetPath}`)
    .split("/")
    .filter(Boolean);
  const normalized: string[] = [];

  segments.forEach((segment) => {
    if (segment === ".") {
      return;
    }

    if (segment === "..") {
      normalized.pop();
      return;
    }

    normalized.push(segment);
  });

  return `/${normalized.join("/")}`.replace(/\/+/g, "/") || "/";
}

function formatWindowState(window: RuntimeSnapshot["windows"][number], activeWindowId: string | null) {
  if (window.isMaximized) {
    return "max";
  }

  if (window.isMinimized) {
    return "min";
  }

  if (window.id === activeWindowId) {
    return "focus";
  }

  return "open";
}

function resolveWindowTarget(runtime: RuntimeSnapshot | undefined, token: string | undefined) {
  if (!runtime) {
    return { error: "Runtime snapshot unavailable." } as const;
  }

  if (!token) {
    return { error: "Window target required." } as const;
  }

  const normalized = token.toLowerCase();
  const exactMatch = runtime.windows.find((window) => window.id === token);

  if (exactMatch) {
    return { window: exactMatch } as const;
  }

  const partialMatches = runtime.windows.filter(
    (window) =>
      window.id.toLowerCase().startsWith(normalized) ||
      window.appId.toLowerCase() === normalized ||
      window.title.toLowerCase().includes(normalized),
  );

  if (partialMatches.length === 0) {
    return { error: `Window not found: ${token}` } as const;
  }

  if (partialMatches.length > 1) {
    return {
      error: `Window target is ambiguous: ${token}`,
      suggestions: partialMatches.map(
        (window) => `${window.id.slice(0, 6)} :: ${window.appId} :: ${window.title}`,
      ),
    } as const;
  }

  return { window: partialMatches[0] } as const;
}

function resolveProcessTarget(runtime: RuntimeSnapshot | undefined, token: string | undefined) {
  if (!runtime) {
    return { error: "Runtime snapshot unavailable." } as const;
  }

  if (!token) {
    return { error: "Process target required." } as const;
  }

  const normalized = token.toLowerCase();
  const exactMatch = runtime.processes.find((process) => process.id === token);

  if (exactMatch) {
    return { process: exactMatch } as const;
  }

  const partialMatches = runtime.processes.filter(
    (process) =>
      process.id.toLowerCase().startsWith(normalized) ||
      process.appId.toLowerCase() === normalized ||
      process.name.toLowerCase().includes(normalized),
  );

  if (partialMatches.length === 0) {
    return { error: `Process not found: ${token}` } as const;
  }

  if (partialMatches.length > 1) {
    return {
      error: `Process target is ambiguous: ${token}`,
      suggestions: partialMatches.map(
        (process) => `${process.id.slice(0, 8)} :: ${process.appId} :: ${process.name}`,
      ),
    } as const;
  }

  return { process: partialMatches[0] } as const;
}

function getProfileFileLines() {
  const profile = getProfileBasics() as {
    name?: string;
    title?: string;
    location?: string;
    contact?: { email?: string; github?: string };
  };

  return [
    `name: ${profile.name ?? "Unknown"}`,
    `title: ${profile.title ?? "Unknown"}`,
    `location: ${profile.location ?? "Unknown"}`,
    `email: ${profile.contact?.email ?? "Unknown"}`,
    `github: ${profile.contact?.github ?? "Unknown"}`,
  ];
}

// ── Real File System Helpers ────────────────────────────

function formatNodeEntry(node: FileSystemNode): string {
  return node.type === "directory" ? `${node.name}/` : node.name;
}

function listRealDirectory(path: string): string[] | null {
  const absPath = path as AbsolutePath;

  if (path === "/") {
    // Root: show top-level directories from the real FS
    const nodes = listPath(absPath);

    return nodes.length > 0 ? nodes.map(formatNodeEntry) : null;
  }

  const node = getNodeAtPath(absPath);

  if (!node || node.type !== "directory") {
    return null;
  }

  const children = listPath(absPath);

  return children.map(formatNodeEntry);
}

async function readRealFile(path: string): Promise<string[] | null> {
  const absPath = path as AbsolutePath;
  const node = getNodeAtPath(absPath);

  if (!node || node.type !== "file") {
    return null;
  }

  const content = await readFileAtPath(absPath);

  if (content === null) {
    return ["(empty file)"];
  }

  return content.split("\n");
}

function buildTreeLines(
  path: string,
  prefix: string,
  maxDepth: number,
  currentDepth: number,
): string[] {
  const absPath = path as AbsolutePath;
  const children = listPath(absPath);

  if (children.length === 0) {
    return [];
  }

  const lines: string[] = [];

  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    const connector = isLast ? "`-- " : "|-- ";
    const entry = formatNodeEntry(child);

    lines.push(`${prefix}${connector}${entry}`);

    if (child.type === "directory" && currentDepth < maxDepth) {
      const childPath = path === "/" ? `/${child.name}` : `${path}/${child.name}`;
      const childPrefix = prefix + (isLast ? "    " : "|   ");

      lines.push(...buildTreeLines(childPath, childPrefix, maxDepth, currentDepth + 1));
    }
  });

  return lines;
}

// ── Terminal Command Runner (async) ─────────────────────

export async function runTerminalCommand(
  input: string,
  availableApps: TerminalAppInfo[],
  currentPath: string,
  context: TerminalContext = {},
): Promise<TerminalResult> {
  const [command, ...args] = input.trim().split(/\s+/);

  const runtime = context.runtime;

  if (!command) {
    return { output: [] };
  }

  switch (command) {
    case "help":
      return {
        output: [
          "help, pwd, ls [path], cd <path>, cat <file>, echo, apps, open <app-id>, date, clear, whoami, tree [path], mkdir <path>, touch <path>, rm <path>, mv <src> <dest>, cp <src> <dest>, ps, windows, sysinfo, focus, minimize, maximize, restore, close, kill",
        ],
      };
    case "clear":
      return {
        output: ["Terminal cleared."],
        clear: true,
      };
    case "pwd":
      return { output: [currentPath] };
    case "ls": {
      const targetPath = normalizeTerminalPath(currentPath, args[0] ?? ".");
      const entries = listRealDirectory(targetPath);

      if (!entries) {
        return { output: [`Directory not found: ${targetPath}`] };
      }

      if (entries.length === 0) {
        return { output: ["(empty directory)"] };
      }

      return { output: entries };
    }
    case "cd": {
      const targetPath = normalizeTerminalPath(currentPath, args[0] ?? "/");

      if (targetPath === "/") {
        return {
          output: [`Current directory: /`],
          nextPath: "/",
        };
      }

      const node = getNodeAtPath(targetPath as AbsolutePath);

      if (!node || node.type !== "directory") {
        return { output: [`Directory not found: ${targetPath}`] };
      }

      return {
        output: [`Current directory: ${targetPath}`],
        nextPath: targetPath,
      };
    }
    case "cat": {
      if (!args[0]) {
        return { output: ["Usage: cat <file>"] };
      }

      const targetPath = normalizeTerminalPath(currentPath, args[0]);
      const fileContents = await readRealFile(targetPath);

      if (!fileContents) {
        return { output: [`File not found: ${targetPath}`] };
      }

      return { output: fileContents };
    }
    case "mkdir": {
      if (!args[0]) {
        return { output: ["Usage: mkdir <path>"] };
      }

      const targetPath = normalizeTerminalPath(currentPath, args[0]);

      if (existsAtPath(targetPath as AbsolutePath)) {
        return { output: [`Already exists: ${targetPath}`] };
      }

      const created = await createDirectoryAtPath(targetPath as AbsolutePath);

      if (!created) {
        return { output: [`Failed to create directory: ${targetPath}`] };
      }

      return { output: [`Created directory: ${targetPath}`] };
    }
    case "touch": {
      if (!args[0]) {
        return { output: ["Usage: touch <path>"] };
      }

      const targetPath = normalizeTerminalPath(currentPath, args[0]);

      if (existsAtPath(targetPath as AbsolutePath)) {
        return { output: [`Already exists: ${targetPath}`] };
      }

      const created = await createFileAtPath(targetPath as AbsolutePath, "");

      if (!created) {
        return { output: [`Failed to create file: ${targetPath}`] };
      }

      return { output: [`Created file: ${targetPath}`] };
    }
    case "rm": {
      if (!args[0]) {
        return { output: ["Usage: rm <path>"] };
      }

      const targetPath = normalizeTerminalPath(currentPath, args[0]);
      const success = await deleteAtPath(targetPath as AbsolutePath);

      if (!success) {
        return { output: [`Not found: ${targetPath}`] };
      }

      return { output: [`Removed: ${targetPath}`] };
    }
    case "mv": {
      if (!args[0] || !args[1]) {
        return { output: ["Usage: mv <source> <destination>"] };
      }

      const srcPath = normalizeTerminalPath(currentPath, args[0]);
      const destPath = normalizeTerminalPath(currentPath, args[1]);
      const success = await moveToPath(srcPath as AbsolutePath, destPath as AbsolutePath);

      if (!success) {
        return { output: [`Failed to move: ${srcPath} -> ${destPath}`] };
      }

      return { output: [`Moved: ${srcPath} -> ${destPath}`] };
    }
    case "cp": {
      if (!args[0] || !args[1]) {
        return { output: ["Usage: cp <source> <destination>"] };
      }

      const srcPath = normalizeTerminalPath(currentPath, args[0]);
      const destPath = normalizeTerminalPath(currentPath, args[1]);
      const copied = await copyToPath(srcPath as AbsolutePath, destPath as AbsolutePath);

      if (!copied) {
        return { output: [`Failed to copy: ${srcPath} -> ${destPath}`] };
      }

      return { output: [`Copied: ${srcPath} -> ${destPath}`] };
    }
    case "echo":
      return { output: [args.join(" ")] };
    case "date":
      return { output: [new Date().toString()] };
    case "whoami":
      return { output: ["maivandrahmani"] };
    case "apps":
      return {
        output: availableApps.map((app) => `${app.id} :: ${app.name}`),
      };
    case "tree": {
      const targetPath = normalizeTerminalPath(currentPath, args[0] ?? ".");

      if (targetPath === "/") {
        const rootEntries = listRealDirectory("/");

        if (!rootEntries) {
          return { output: ["(empty filesystem)"] };
        }

        const treeLines = buildTreeLines("/", "", 3, 0);

        return {
          output: ["/", ...treeLines],
        };
      }

      const node = getNodeAtPath(targetPath as AbsolutePath);

      if (!node || node.type !== "directory") {
        return { output: [`Directory not found: ${targetPath}`] };
      }

      const treeLines = buildTreeLines(targetPath, "", 3, 0);

      return {
        output: [targetPath, ...treeLines],
      };
    }
    case "ps": {
      if (!runtime) {
        return { output: ["Runtime snapshot unavailable."] };
      }

      if (runtime.processes.length === 0) {
        return { output: ["No running processes."] };
      }

      return {
        output: [
          "PID      APP           NAME",
          ...runtime.processes.map((process) => {
            const pid = process.id.slice(0, 8);
            return `${pid.padEnd(8)} ${process.appId.padEnd(12)} ${process.name}`;
          }),
        ],
      };
    }
    case "windows": {
      if (!runtime) {
        return { output: ["Runtime snapshot unavailable."] };
      }

      if (runtime.windows.length === 0) {
        return { output: ["No open windows."] };
      }

      return {
        output: [
          "WINDOW   APP           STATE      TITLE",
          ...runtime.windows.map((window) => {
            const state = window.isMaximized
              ? "max"
              : window.isMinimized
                ? "min"
                : window.id === runtime.activeWindowId
                  ? "focus"
                  : "open";
            return `${window.id.slice(0, 6).padEnd(8)} ${window.appId.padEnd(12)} ${state.padEnd(10)} ${window.title}`;
          }),
        ],
      };
    }
    case "sysinfo": {
      if (!runtime) {
        return { output: ["Runtime snapshot unavailable."] };
      }

      return {
        output: [
          `boot phase: ${runtime.bootPhase}`,
          `boot progress: ${runtime.bootProgress}%`,
          `apps installed: ${runtime.apps.length}`,
          `running processes: ${runtime.processes.length}`,
          `open windows: ${runtime.windows.length}`,
          `active window: ${runtime.activeWindowId ?? "none"}`,
        ],
      };
    }
    case "open": {
      const appId = args[0];
      const match = availableApps.find((app) => app.id === appId);

      if (!match) {
        return { output: [`Unknown app: ${appId ?? "(missing)"}`] };
      }

      return {
        output: [`Opening ${match.name}...`],
        openAppId: match.id,
      };
    }
    case "focus":
    case "close":
    case "minimize":
    case "maximize":
    case "restore": {
      const target = resolveWindowTarget(runtime, args[0]);

      if ("error" in target) {
        const errorTarget = target as { error: string; suggestions?: string[] };

        return {
          output: [errorTarget.error, ...(errorTarget.suggestions ?? [])],
        };
      }

      return {
        output: [
          `${command} ${target.window.title} (${target.window.id.slice(0, 6)})`,
          `Current state: ${formatWindowState(target.window, runtime?.activeWindowId ?? null)}`,
        ],
        windowAction: {
          type: command,
          targetWindowId: target.window.id,
        },
      };
    }
    case "kill": {
      const target = resolveProcessTarget(runtime, args[0]);

      if ("error" in target) {
        const errorTarget = target as { error: string; suggestions?: string[] };

        return {
          output: [errorTarget.error, ...(errorTarget.suggestions ?? [])],
        };
      }

      return {
        output: [`Terminating ${target.process.name} (${target.process.id.slice(0, 8)})...`],
        processAction: {
          type: "terminate",
          targetProcessId: target.process.id,
        },
      };
    }
    default:
      return { output: [`Command not found: ${command}`] };
  }
}
