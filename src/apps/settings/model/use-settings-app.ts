"use client";

import { useCallback } from "react";

import { useOSStore } from "@/processes";
import type { Wallpaper } from "@/shared/lib/app-data/wallpapers";
import * as idb from "@/shared/lib/fs/idb-storage";

import type { OSSettings } from "./settings.types";

export type UseSettingsAppResult = {
  osSettings: OSSettings;
  wallpaperId: string;
  customWallpaperDataUrl: string | null;
  processCount: number;
  windowCount: number;
  fsNodeCount: number;
  updateSettings: (patch: Partial<OSSettings>) => Promise<void>;
  setWallpaperId: (id: Wallpaper["id"]) => void;
  setCustomWallpaper: (dataUrl: string) => Promise<void>;
  exportVfs: () => Promise<void>;
  clearVfs: () => Promise<void>;
  resetSettings: () => Promise<void>;
};

export function useSettingsApp(): UseSettingsAppResult {
  const osSettings = useOSStore((state) => state.osSettings);
  const wallpaperId = useOSStore((state) => state.wallpaperId);
  const customWallpaperDataUrl = useOSStore((state) => state.customWallpaperDataUrl);
  const processes = useOSStore((state) => state.processes);
  const windows = useOSStore((state) => state.windows);
  const fsNodes = useOSStore((state) => state.fsNodes);
  const updateSettingsAction = useOSStore((state) => state.updateSettings);
  const setWallpaperAction = useOSStore((state) => state.setWallpaper);
  const setCustomWallpaperAction = useOSStore((state) => state.setCustomWallpaper);

  const updateSettings = useCallback(
    (patch: Partial<OSSettings>) => updateSettingsAction(patch),
    [updateSettingsAction],
  );

  const setWallpaperId = useCallback(
    (id: Wallpaper["id"]) => setWallpaperAction(id),
    [setWallpaperAction],
  );

  const setCustomWallpaper = useCallback(
    (dataUrl: string) => setCustomWallpaperAction(dataUrl),
    [setCustomWallpaperAction],
  );

  const exportVfs = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const data = await idb.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `portos-vfs-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const clearVfs = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    await idb.clearAll();
    window.location.reload();
  }, []);

  const resetSettings = useCallback(async () => {
    await updateSettingsAction({
      colorScheme: "light",
      accentColor: "blue",
      dockIconSize: "medium",
      dockAutohide: false,
      reduceMotion: false,
      reduceTransparency: false,
    });
  }, [updateSettingsAction]);

  return {
    osSettings,
    wallpaperId,
    customWallpaperDataUrl,
    processCount: processes.length,
    windowCount: windows.length,
    fsNodeCount: fsNodes.length,
    updateSettings,
    setWallpaperId,
    setCustomWallpaper,
    exportVfs,
    clearVfs,
    resetSettings,
  };
}
