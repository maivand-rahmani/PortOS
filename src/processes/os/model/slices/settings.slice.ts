import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import { PERSISTED_FILE_PATHS } from "@/shared/lib/fs-paths";
import {
  DEFAULT_OS_SETTINGS,
} from "@/apps/settings/model/settings.types";
import {
  loadSettings,
  loadCustomWallpaper,
} from "@/apps/settings/model/settings.idb";
import { applySettingsToDOM } from "./helpers";
import { writeFsJsonAtPath } from "./fs-path-helpers";

export type SettingsSlice = Pick<
  OSStore,
  | "osSettings"
  | "hydrateSettings"
  | "updateSettings"
>;

export const createSettingsSlice: StateCreator<OSStore, [], [], SettingsSlice> = (set, get) => ({
  osSettings: DEFAULT_OS_SETTINGS,

  hydrateSettings: async () => {
    if (typeof window === "undefined") {
      return;
    }

    const [settings, customWallpaper] = await Promise.all([
      loadSettings(),
      loadCustomWallpaper(),
    ]);

    applySettingsToDOM(settings);

    set({
      osSettings: settings,
      customWallpaperDataUrl: customWallpaper,
    });
  },

  updateSettings: async (patch) => {
    const current = get().osSettings;
    const next = { ...current, ...patch };

    applySettingsToDOM(next);
    set({ osSettings: next });

    await writeFsJsonAtPath(get, PERSISTED_FILE_PATHS.settingsPreferences, next);
  },
});
