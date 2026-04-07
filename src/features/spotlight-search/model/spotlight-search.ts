import type { AppConfig } from "@/entities/app";
import type { FileSystemNode } from "@/entities/file-system";
import type { WindowInstance } from "@/entities/window";
import { formatShortcutBinding, type Shortcut, type ShortcutBinding, type SystemShortcutBinding } from "@/processes";

// ── Result types ────────────────────────────────────────────────────────────

export type SpotlightCategory =
  | "app"
  | "window"
  | "file"
  | "shortcut"
  | "action";

export type SpotlightResultBase = {
  id: string;
  label: string;
  category: SpotlightCategory;
  /** Optional secondary text (description, path, key combo, etc.) */
  detail?: string;
};

export type SpotlightAppResult = SpotlightResultBase & {
  category: "app";
  appId: string;
};

export type SpotlightWindowResult = SpotlightResultBase & {
  category: "window";
  windowId: string;
  appId: string;
};

export type SpotlightFileResult = SpotlightResultBase & {
  category: "file";
  nodeId: string;
  path: string;
};

export type SpotlightShortcutResult = SpotlightResultBase & {
  category: "shortcut";
  shortcutId: string;
  binding?: ShortcutBinding;
};

export type SpotlightActionResult = SpotlightResultBase & {
  category: "action";
  actionId: string;
};

export type SpotlightResult =
  | SpotlightAppResult
  | SpotlightWindowResult
  | SpotlightFileResult
  | SpotlightShortcutResult
  | SpotlightActionResult;

export type SpotlightResultGroup = {
  category: SpotlightCategory;
  label: string;
  results: SpotlightResult[];
};

// ── Category labels ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<SpotlightCategory, string> = {
  app: "Applications",
  window: "Open Windows",
  file: "Files",
  shortcut: "Keyboard Shortcuts",
  action: "System Actions",
};

// ── Search helpers ──────────────────────────────────────────────────────────

function fuzzyMatch(query: string, text: string): boolean {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  // Substring match
  if (lowerText.includes(lowerQuery)) return true;

  // Simple character-by-character fuzzy match
  let qi = 0;

  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) qi++;
  }

  return qi === lowerQuery.length;
}

function matchScore(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  // Exact match scores highest
  if (lowerText === lowerQuery) return 100;
  // Starts-with is next best
  if (lowerText.startsWith(lowerQuery)) return 80;
  // Contains is good
  if (lowerText.includes(lowerQuery)) return 60;
  // Fuzzy match is lowest
  return 30;
}

// ── Individual search functions ─────────────────────────────────────────────

function searchApps(query: string, apps: AppConfig[]): SpotlightAppResult[] {
  return apps
    .filter(
      (app) =>
        fuzzyMatch(query, app.name) ||
        fuzzyMatch(query, app.description) ||
        fuzzyMatch(query, app.id),
    )
    .map((app) => ({
      id: `app:${app.id}`,
      label: app.name,
      detail: app.description,
      category: "app" as const,
      appId: app.id,
    }))
    .sort((a, b) => matchScore(query, b.label) - matchScore(query, a.label));
}

function searchWindows(
  query: string,
  windows: WindowInstance[],
  appMap: Record<string, AppConfig>,
): SpotlightWindowResult[] {
  return windows
    .filter((w) => !w.isMinimized)
    .filter((w) => {
      const app = appMap[w.appId];
      const title = w.title || app?.name || "";

      return fuzzyMatch(query, title) || (app && fuzzyMatch(query, app.name));
    })
    .map((w) => {
      const app = appMap[w.appId];

      return {
        id: `window:${w.id}`,
        label: w.title || app?.name || "Untitled",
        detail: app?.name,
        category: "window" as const,
        windowId: w.id,
        appId: w.appId,
      };
    })
    .sort((a, b) => matchScore(query, b.label) - matchScore(query, a.label));
}

function searchFiles(
  query: string,
  nodes: FileSystemNode[],
  getPath: (nodeId: string) => string,
): SpotlightFileResult[] {
  return nodes
    .filter((n) => !n.isHidden && fuzzyMatch(query, n.name))
    .slice(0, 20) // limit file results to avoid overwhelming the UI
    .map((n) => ({
      id: `file:${n.id}`,
      label: n.name,
      detail: getPath(n.id),
      category: "file" as const,
      nodeId: n.id,
      path: getPath(n.id),
    }))
    .sort((a, b) => matchScore(query, b.label) - matchScore(query, a.label));
}

function searchSystemShortcuts(
  query: string,
  bindings: SystemShortcutBinding[],
): SpotlightShortcutResult[] {
  return bindings
    .filter(
      (b) =>
        fuzzyMatch(query, b.label) ||
        fuzzyMatch(query, b.id) ||
        fuzzyMatch(query, formatShortcutBinding(b.binding)),
    )
    .map((b) => ({
      id: `shortcut:${b.id}`,
      label: b.label,
      detail: formatShortcutBinding(b.binding),
      category: "shortcut" as const,
      shortcutId: b.id,
      binding: b.binding,
    }))
    .sort((a, b) => matchScore(query, b.label) - matchScore(query, a.label));
}

function searchAppShortcuts(
  query: string,
  shortcuts: Shortcut[],
  systemBindings: SystemShortcutBinding[],
): SpotlightShortcutResult[] {
  // Exclude shortcuts that are just runtime representations of the system bindings
  const systemIds = new Set<string>(systemBindings.map((b) => b.id));
  
  return shortcuts
    .filter((s) => !systemIds.has(s.id))
    .filter((s) => {
      const binding: ShortcutBinding = { kind: "combo", key: s.key, modifiers: s.modifiers };
      return (
        fuzzyMatch(query, s.label) ||
        fuzzyMatch(query, s.id) ||
        fuzzyMatch(query, formatShortcutBinding(binding))
      );
    })
    .map((s) => {
      const binding: ShortcutBinding = { kind: "combo", key: s.key, modifiers: s.modifiers };
      return {
        id: `shortcut:${s.id}`,
        label: s.label,
        detail: formatShortcutBinding(binding),
        category: "shortcut" as const,
        shortcutId: s.id,
        binding,
      };
    })
    .sort((a, b) => matchScore(query, b.label) - matchScore(query, a.label));
}

// ── System actions (static, always available) ───────────────────────────────

const SYSTEM_ACTIONS: SpotlightActionResult[] = [
  {
    id: "action:toggle-dark-mode",
    label: "Toggle Dark Mode",
    detail: "Switch between light and dark appearance",
    category: "action",
    actionId: "toggle-dark-mode",
  },
  {
    id: "action:toggle-dock-autohide",
    label: "Toggle Dock Auto-Hide",
    detail: "Show or hide the dock automatically",
    category: "action",
    actionId: "toggle-dock-autohide",
  },
];

function searchActions(query: string): SpotlightActionResult[] {
  return SYSTEM_ACTIONS.filter(
    (a) => fuzzyMatch(query, a.label) || fuzzyMatch(query, a.detail ?? ""),
  ).sort((a, b) => matchScore(query, b.label) - matchScore(query, a.label));
}

// ── Main search entry point ─────────────────────────────────────────────────

export type SpotlightSearchInput = {
  query: string;
  apps: AppConfig[];
  windows: WindowInstance[];
  appMap: Record<string, AppConfig>;
  fsNodes: FileSystemNode[];
  shortcuts: Shortcut[];
  systemShortcutBindings: SystemShortcutBinding[];
  getNodePath: (nodeId: string) => string;
};

/**
 * Run a spotlight search across all system entities.
 *
 * Returns results grouped by category, in priority order.
 * Empty query returns no results.
 */
export function spotlightSearch(
  input: SpotlightSearchInput,
): SpotlightResultGroup[] {
  const { query } = input;

  if (!query.trim()) return [];

  const trimmed = query.trim();

  const groups: SpotlightResultGroup[] = [];

  const appResults = searchApps(trimmed, input.apps);

  if (appResults.length > 0) {
    groups.push({
      category: "app",
      label: CATEGORY_LABELS.app,
      results: appResults,
    });
  }

  const windowResults = searchWindows(
    trimmed,
    input.windows,
    input.appMap,
  );

  if (windowResults.length > 0) {
    groups.push({
      category: "window",
      label: CATEGORY_LABELS.window,
      results: windowResults,
    });
  }

  const fileResults = searchFiles(
    trimmed,
    input.fsNodes,
    input.getNodePath,
  );

  if (fileResults.length > 0) {
    groups.push({
      category: "file",
      label: CATEGORY_LABELS.file,
      results: fileResults,
    });
  }

  const systemShortcutResults = searchSystemShortcuts(trimmed, input.systemShortcutBindings);
  const appShortcutResults = searchAppShortcuts(trimmed, input.shortcuts, input.systemShortcutBindings);
  
  const allShortcutResults = [...systemShortcutResults, ...appShortcutResults].sort((a, b) => matchScore(query, b.label) - matchScore(query, a.label));

  if (allShortcutResults.length > 0) {
    groups.push({
      category: "shortcut",
      label: CATEGORY_LABELS.shortcut,
      results: allShortcutResults,
    });
  }

  const actionResults = searchActions(trimmed);

  if (actionResults.length > 0) {
    groups.push({
      category: "action",
      label: CATEGORY_LABELS.action,
      results: actionResults,
    });
  }

  return groups;
}

/** Flatten grouped results into a single ordered array for keyboard nav. */
export function flattenResults(groups: SpotlightResultGroup[]): SpotlightResult[] {
  return groups.flatMap((g) => g.results);
}
