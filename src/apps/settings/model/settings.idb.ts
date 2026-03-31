import * as idb from "@/shared/lib/idb-storage";

import {
  DEFAULT_OS_SETTINGS,
  SETTINGS_IDB_KEY,
  CUSTOM_WALLPAPER_IDB_KEY,
  type OSSettings,
} from "./settings.types";

// ── Settings Persistence ──────────────────────────────────────────────────────

export async function loadSettings(): Promise<OSSettings> {
  const stored = await idb.getMeta(SETTINGS_IDB_KEY);

  if (!stored || typeof stored !== "object") {
    return DEFAULT_OS_SETTINGS;
  }

  return {
    ...DEFAULT_OS_SETTINGS,
    ...(stored as Partial<OSSettings>),
  };
}

export async function saveSettings(settings: OSSettings): Promise<void> {
  await idb.setMeta(SETTINGS_IDB_KEY, settings);
}

// ── Custom Wallpaper Persistence ──────────────────────────────────────────────

export async function loadCustomWallpaper(): Promise<string | null> {
  const stored = await idb.getMeta(CUSTOM_WALLPAPER_IDB_KEY);

  if (typeof stored !== "string") {
    return null;
  }

  return stored;
}

export async function saveCustomWallpaper(dataUrl: string): Promise<void> {
  await idb.setMeta(CUSTOM_WALLPAPER_IDB_KEY, dataUrl);
}
