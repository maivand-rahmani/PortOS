"use client";

import { useRef } from "react";

import { cn } from "@/shared/lib";
import { WALLPAPERS, getWallpaperById } from "@/shared/lib/wallpapers";
import type { UseSettingsAppResult } from "../../model/use-settings-app";

type WallpaperSectionProps = Pick<
  UseSettingsAppResult,
  "wallpaperId" | "customWallpaperDataUrl" | "setWallpaperId" | "setCustomWallpaper"
>;

export function WallpaperSection({
  wallpaperId,
  customWallpaperDataUrl,
  setWallpaperId,
  setCustomWallpaper,
}: WallpaperSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;

      void setCustomWallpaper(dataUrl);
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Wallpaper</h2>
        <p className="mt-1 text-sm text-muted">Choose a desktop background.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {WALLPAPERS.map((wallpaper) => {
          const isSelected = wallpaper.id === wallpaperId;

          return (
            <button
              key={wallpaper.id}
              type="button"
              onClick={() => setWallpaperId(wallpaper.id)}
              className={cn(
                "group cursor-pointer overflow-hidden rounded-2xl border-2 transition duration-200",
                isSelected
                  ? "border-accent shadow-[0_4px_20px_rgba(10,132,255,0.25)]"
                  : "border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:border-accent/40",
              )}
            >
              <div
                className="relative aspect-[4/3] w-full"
                style={{ background: wallpaper.gradient }}
              >
                <div className="absolute inset-0" style={{ background: wallpaper.overlay }} />
                <div
                  className="absolute left-[-12%] top-[12%] h-12 w-12 rounded-full blur-2xl"
                  style={{ backgroundColor: wallpaper.orb1 }}
                />
                <div
                  className="absolute bottom-[-14%] right-[-8%] h-14 w-14 rounded-full blur-2xl"
                  style={{ backgroundColor: wallpaper.orb2 }}
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-md">
                      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8.5l3.5 3.5 6.5-7" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-surface px-2.5 py-1.5 text-center">
                <span className="text-xs font-semibold text-foreground">{wallpaper.name}</span>
              </div>
            </button>
          );
        })}

        {/* Custom wallpaper tile */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group cursor-pointer overflow-hidden rounded-2xl border-2 transition duration-200",
            wallpaperId === "custom"
              ? "border-accent shadow-[0_4px_20px_rgba(10,132,255,0.25)]"
              : "border-dashed border-border hover:border-accent/40",
          )}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {customWallpaperDataUrl ? (
              <img
                src={customWallpaperDataUrl}
                alt="Custom wallpaper"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-muted" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
            )}
            {wallpaperId === "custom" && customWallpaperDataUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-md">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5l3.5 3.5 6.5-7" />
                  </svg>
                </span>
              </div>
            )}
          </div>
          <div className="bg-surface px-2.5 py-1.5 text-center">
            <span className="text-xs font-semibold text-foreground">Custom</span>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {wallpaperId !== "custom" && (
        <p className="text-xs text-muted">
          Current: <span className="font-medium">{getWallpaperById(wallpaperId).name}</span>
        </p>
      )}
    </div>
  );
}
