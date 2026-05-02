import type { WindowPosition } from "@/entities/window";

// ── Icon Positions ───────────────────────────────────────

export type DesktopIconMap = Record<string, WindowPosition>;

// ── Sort ─────────────────────────────────────────────────

export type SortKey = "name" | "type" | "date";

export type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
};

export const DEFAULT_DESKTOP_SORT: SortConfig = {
  key: "name",
  direction: "asc",
};

// ── View Mode ────────────────────────────────────────────

export type ViewMode = "grid" | "compact";

export const DEFAULT_DESKTOP_VIEW_MODE: ViewMode = "grid";

// ── Clean-Up Mode ────────────────────────────────────────

export type CleanUpMode = "by-order" | "by-name" | "by-type" | "by-date" | null;

// ── Rename State ─────────────────────────────────────────

export type DesktopRenameState = {
  itemId: string;
  currentName: string;
} | null;

// ── Full Manager State ───────────────────────────────────

export type DesktopManagerState = {
  /** Persisted map of itemId → {x,y} positions for desktop icons */
  desktopIconPositions: DesktopIconMap;
  /** @deprecated Use desktopSelections[0] ?? null for single-selection compat */
  desktopSelection: string | null;
  /** Multi-selection array — one item per entry like "app:blog" or "fs:<nodeId>" */
  desktopSelections: string[];
  /** Last clicked item (for shift+click range selection anchor) */
  desktopLastClicked: string | null;
  /** Active clean-up mode (null when not in clean-up) */
  desktopCleanUpMode: CleanUpMode;
  /** Whether layout needs recalculation (dirty flag for grid engine) */
  desktopLayoutDirty: boolean;
  /** Active sort configuration */
  desktopSort: SortConfig;
  /** Active view mode */
  desktopViewMode: ViewMode;
  /** Active rename target (null when not renaming) */
  desktopRenameState: DesktopRenameState;
  /** Whether desktop state has been hydrated from persistence */
  desktopHydrated: boolean;
};

export const desktopManagerInitialState: DesktopManagerState = {
  desktopIconPositions: {},
  desktopSelection: null,
  desktopSelections: [],
  desktopLastClicked: null,
  desktopCleanUpMode: null,
  desktopLayoutDirty: false,
  desktopSort: DEFAULT_DESKTOP_SORT,
  desktopViewMode: DEFAULT_DESKTOP_VIEW_MODE,
  desktopRenameState: null,
  desktopHydrated: false,
};
