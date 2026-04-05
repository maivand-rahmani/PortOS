// ── OS Settings Types ────────────────────────────────────────────────────────

export type ColorScheme = "light" | "dark" | "system";

export type AccentColor =
  | "blue"
  | "purple"
  | "pink"
  | "orange"
  | "green"
  | "red";

export type DockIconSize = "small" | "medium" | "large";

export type OSSettings = {
  colorScheme: ColorScheme;
  accentColor: AccentColor;
  dockIconSize: DockIconSize;
  dockAutohide: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
};

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_OS_SETTINGS: OSSettings = {
  colorScheme: "light",
  accentColor: "blue",
  dockIconSize: "medium",
  dockAutohide: false,
  reduceMotion: false,
  reduceTransparency: false,
};

// ── Accent Color Map ──────────────────────────────────────────────────────────

export const ACCENT_COLOR_MAP: Record<AccentColor, { label: string; value: string }> = {
  blue: { label: "Blue", value: "#0a84ff" },
  purple: { label: "Purple", value: "#bf5af2" },
  pink: { label: "Pink", value: "#ff375f" },
  orange: { label: "Orange", value: "#ff9f0a" },
  green: { label: "Green", value: "#30d158" },
  red: { label: "Red", value: "#ff453a" },
};

// ── Dock Icon Size Map ────────────────────────────────────────────────────────

export const DOCK_ICON_SIZE_MAP: Record<DockIconSize, { label: string; px: number }> = {
  small: { label: "Small", px: 48 },
  medium: { label: "Medium", px: 56 },
  large: { label: "Large", px: 64 },
};
