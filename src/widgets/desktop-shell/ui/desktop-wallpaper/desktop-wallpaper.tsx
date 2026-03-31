"use client";

import { useEffect } from "react";

import { useOSStore } from "@/processes";

import { getWallpaperById } from "@/shared/lib/wallpapers";

export function DesktopWallpaper() {
  const wallpaperId = useOSStore((state) => state.wallpaperId);
  const customWallpaperDataUrl = useOSStore((state) => state.customWallpaperDataUrl);
  const hydrateWallpaper = useOSStore((state) => state.hydrateWallpaper);

  useEffect(() => {
    hydrateWallpaper();
  }, [hydrateWallpaper]);

  const isCustom = wallpaperId === "custom" && customWallpaperDataUrl;

  if (isCustom) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-all duration-700 ease-in-out bg-cover bg-center"
          style={{ backgroundImage: `url(${customWallpaperDataUrl})` }}
        />
      </div>
    );
  }

  const wallpaper = getWallpaperById(wallpaperId);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-700 ease-in-out"
        style={{ background: wallpaper.gradient }}
      />
      <div
        className="absolute inset-0 transition-all duration-700 ease-in-out"
        style={{ background: wallpaper.overlay }}
      />
      <div
        className="absolute left-[-12%] top-[12%] h-[24rem] w-[24rem] rounded-full blur-3xl transition-all duration-700 ease-in-out"
        style={{ backgroundColor: wallpaper.orb1 }}
      />
      <div
        className="absolute bottom-[-14%] right-[-8%] h-[28rem] w-[28rem] rounded-full blur-3xl transition-all duration-700 ease-in-out"
        style={{ backgroundColor: wallpaper.orb2 }}
      />
    </div>
  );
}
