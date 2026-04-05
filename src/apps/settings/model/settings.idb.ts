import { PERSISTED_FILE_PATHS } from "@/shared/lib/fs-paths";
import { readFsJsonAtPath } from "@/shared/lib/fs-file-storage";

import {
  DEFAULT_OS_SETTINGS,
  type OSSettings,
} from "./settings.types";

type WallpaperPreferences = {
  wallpaperId: string;
  customWallpaperDataUrl: string | null;
};

function normalizeSettings(stored: Partial<OSSettings> | null | undefined): OSSettings {
  return {
    ...DEFAULT_OS_SETTINGS,
    ...(stored ?? {}),
  };
}

async function readWallpaperPreferences(): Promise<WallpaperPreferences> {
  const stored = await readFsJsonAtPath<WallpaperPreferences>(
    PERSISTED_FILE_PATHS.settingsWallpaper,
  );

  return {
    wallpaperId: typeof stored?.wallpaperId === "string" ? stored.wallpaperId : "default",
    customWallpaperDataUrl:
      typeof stored?.customWallpaperDataUrl === "string"
        ? stored.customWallpaperDataUrl
        : null,
  };
}

export async function loadSettings(): Promise<OSSettings> {
  const stored = await readFsJsonAtPath<Partial<OSSettings>>(
    PERSISTED_FILE_PATHS.settingsPreferences,
  );

  return normalizeSettings(stored);
}

export async function loadWallpaperId(): Promise<string> {
  const stored = await readWallpaperPreferences();

  return stored.wallpaperId;
}

export async function loadCustomWallpaper(): Promise<string | null> {
  const stored = await readWallpaperPreferences();

  return stored.customWallpaperDataUrl;
}
