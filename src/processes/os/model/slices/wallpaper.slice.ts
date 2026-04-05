import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import { PERSISTED_FILE_PATHS } from "@/shared/lib/fs-paths";
import { DEFAULT_WALLPAPER_ID, getWallpaperById } from "@/shared/lib/wallpapers";
import { loadWallpaperId } from "@/apps/settings/model/settings.idb";
import { writeFsJsonAtPath } from "./fs-path-helpers";

export type WallpaperSlice = Pick<
  OSStore,
  | "wallpaperId"
  | "customWallpaperDataUrl"
  | "hydrateWallpaper"
  | "setWallpaper"
  | "setCustomWallpaper"
>;

export const createWallpaperSlice: StateCreator<OSStore, [], [], WallpaperSlice> = (set, get) => ({
  wallpaperId: DEFAULT_WALLPAPER_ID,
  customWallpaperDataUrl: null,

  hydrateWallpaper: () => {
    if (typeof window === "undefined") {
      return;
    }

    void (async () => {
      const wallpaperId = getWallpaperById(await loadWallpaperId()).id;

      set({ wallpaperId });
    })();
  },

  setWallpaper: (wallpaperId) => {
    const normalizedWallpaperId = getWallpaperById(wallpaperId).id;

    set({ wallpaperId: normalizedWallpaperId });

    if (typeof window !== "undefined") {
      void writeFsJsonAtPath(get, PERSISTED_FILE_PATHS.settingsWallpaper, {
        wallpaperId: normalizedWallpaperId,
        customWallpaperDataUrl: get().customWallpaperDataUrl,
      });
    }
  },

  setCustomWallpaper: async (dataUrl) => {
    set({ wallpaperId: "custom", customWallpaperDataUrl: dataUrl });

    if (typeof window !== "undefined") {
      await writeFsJsonAtPath(get, PERSISTED_FILE_PATHS.settingsWallpaper, {
        wallpaperId: "custom",
        customWallpaperDataUrl: dataUrl,
      });
    }
  },
});
