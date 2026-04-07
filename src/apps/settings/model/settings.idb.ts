import { PERSISTED_FILE_PATHS } from "@/shared/lib/fs/fs-paths";
import { readFsJsonAtPath } from "@/shared/lib/fs/fs-file-storage";

import {
  DEFAULT_OS_SETTINGS,
  type OSSettings,
} from "./settings.types";

type WallpaperPreferences = {
  wallpaperId: string;
  customWallpaperDataUrl: string | null;
};

function normalizeShortcutBindings(stored: unknown): OSSettings["shortcutBindings"] {
  const defaults = DEFAULT_OS_SETTINGS.shortcutBindings;

  if (!stored || typeof stored !== "object") {
    return defaults;
  }

  const input = stored as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(defaults).map(([id, fallback]) => {
      const candidate = input[id];

      if (!candidate || typeof candidate !== "object") {
        return [id, fallback];
      }

      if (
        "kind" in candidate &&
        candidate.kind === "combo" &&
        "key" in candidate &&
        typeof candidate.key === "string" &&
        "modifiers" in candidate &&
        Array.isArray(candidate.modifiers)
      ) {
        return [
          id,
          {
            kind: "combo" as const,
            key: candidate.key,
            modifiers: candidate.modifiers.filter(
              (modifier): modifier is "meta" | "ctrl" | "alt" | "shift" =>
                modifier === "meta" ||
                modifier === "ctrl" ||
                modifier === "alt" ||
                modifier === "shift",
            ),
          },
        ];
      }

      if (
        "kind" in candidate &&
        candidate.kind === "sequence" &&
        "steps" in candidate &&
        Array.isArray(candidate.steps)
      ) {
        const steps = candidate.steps.filter(
          (step): step is "space" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" =>
            step === "space" || (typeof step === "string" && step.length === 1 && /^[a-z]$/.test(step)),
        );

        return [id, steps.length > 0 ? { kind: "sequence" as const, steps } : fallback];
      }

      return [id, fallback];
    }),
  ) as OSSettings["shortcutBindings"];
}

function normalizeSettings(stored: Partial<OSSettings> | null | undefined): OSSettings {
  const shortcutBindings = normalizeShortcutBindings(stored?.shortcutBindings);

  return {
    ...DEFAULT_OS_SETTINGS,
    ...(stored ?? {}),
    shortcutBindings,
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
