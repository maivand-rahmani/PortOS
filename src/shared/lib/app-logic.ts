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

type TerminalContext = {
  runtime?: RuntimeSnapshot;
};

type TerminalDocsFile = {
  name: string;
  content: string[];
};

const TERMINAL_DOC_FILES: TerminalDocsFile[] = [
  {
    name: "overview.txt",
    content: [
      "PortOS currently focuses on the easy app set.",
      "Use docs, blog, contact, calculator, notes, clock, and terminal to explore the system.",
    ],
  },
  {
    name: "project.txt",
    content: [
      "PortOS is a browser-based portfolio operating system.",
      "The current milestone keeps only easy apps in the live registry.",
    ],
  },
  {
    name: "roadmap.txt",
    content: [
      "Current implementation pass: ship the easy applications first.",
      "Medium and hard apps stay out of the registry until they are revisited.",
    ],
  },
  {
    name: "style.txt",
    content: [
      "Shell styling stays macOS-inspired.",
      "Each app can keep a local theme as long as behavior stays real.",
    ],
  },
];

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

export function buildFormattedWorldClockTime(timeZone: string, use24Hour: boolean) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !use24Hour,
    timeZone,
  }).format(new Date());
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

function getTerminalRootEntries() {
  return ["apps/", "docs/", "profile.txt", "readme.txt", "runtime.txt"];
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

function getTerminalFileContents(pathName: string, availableApps: TerminalAppInfo[]) {
  if (pathName === "/readme.txt") {
    return [
      "Available commands:",
      "help, pwd, ls [path], cd <path>, cat <file>, echo, apps, open <app-id>, date",
    ];
  }

  if (pathName === "/profile.txt") {
    return getProfileFileLines();
  }

  if (pathName === "/runtime.txt") {
    return [
      "PortOS runtime report",
      "Use `sysinfo`, `ps`, and `windows` for live state.",
    ];
  }

  if (pathName.startsWith("/apps/")) {
    const fileName = pathName.replace("/apps/", "");
    const appId = fileName.replace(/\.app$/, "");
    const app = availableApps.find((item) => item.id === appId);

    if (!app || !fileName.endsWith(".app")) {
      return null;
    }

    return [
      `id: ${app.id}`,
      `name: ${app.name}`,
      `description: ${app.description ?? "No description"}`,
    ];
  }

  if (pathName.startsWith("/docs/")) {
    const fileName = pathName.replace("/docs/", "");
    return TERMINAL_DOC_FILES.find((item) => item.name === fileName)?.content ?? null;
  }

  return null;
}

function getTerminalDirectoryEntries(pathName: string, availableApps: TerminalAppInfo[]) {
  if (pathName === "/") {
    return getTerminalRootEntries();
  }

  if (pathName === "/apps") {
    return availableApps.map((app) => `${app.id}.app`);
  }

  if (pathName === "/docs") {
    return TERMINAL_DOC_FILES.map((file) => file.name);
  }

  return null;
}

export function runTerminalCommand(
  input: string,
  availableApps: TerminalAppInfo[],
  currentPath: string,
  context: TerminalContext = {},
) {
  const [command, ...args] = input.trim().split(/\s+/);

  const runtime = context.runtime;

  if (!command) {
    return { output: [] } satisfies TerminalResult;
  }

  switch (command) {
    case "help":
      return {
        output: [
          "help, pwd, ls [path], cd <path>, cat <file>, echo, apps, open <app-id>, date, clear, whoami, tree, ps, windows, sysinfo",
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
      const entries = getTerminalDirectoryEntries(targetPath, availableApps);

      if (!entries) {
        return { output: [`Directory not found: ${targetPath}`] };
      }

      return { output: entries };
    }
    case "cd": {
      const targetPath = normalizeTerminalPath(currentPath, args[0] ?? "/");
      const entries = getTerminalDirectoryEntries(targetPath, availableApps);

      if (!entries) {
        return { output: [`Directory not found: ${targetPath}`] };
      }

      return {
        output: [`Current directory: ${targetPath}`],
        nextPath: targetPath,
      };
    }
    case "cat": {
      const targetPath = normalizeTerminalPath(currentPath, args[0] ?? "");
      const fileContents = getTerminalFileContents(targetPath, availableApps);

      if (!fileContents) {
        return { output: [`File not found: ${targetPath}`] };
      }

      return { output: fileContents };
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
      const rootEntries = getTerminalDirectoryEntries(targetPath, availableApps);

      if (!rootEntries) {
        return { output: [`Directory not found: ${targetPath}`] };
      }

      if (targetPath === "/") {
        return {
          output: [
            "/",
            "|- apps/",
            ...availableApps.map((app) => `|  |- ${app.id}.app`),
            "|- docs/",
            ...TERMINAL_DOC_FILES.map((file) => `|  |- ${file.name}`),
            "|- profile.txt",
            "|- readme.txt",
            "|- runtime.txt",
          ],
        };
      }

      return {
        output: [targetPath, ...rootEntries.map((entry) => `|- ${entry}`)],
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
    default:
      return { output: [`Command not found: ${command}`] };
  }
}
