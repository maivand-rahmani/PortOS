"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/shared/lib";
import type { AppComponentProps } from "@/entities/app";

import { useSettingsApp } from "../model/use-settings-app";
import { WallpaperSection } from "./sections/wallpaper-section";
import { AppearanceSection } from "./sections/appearance-section";
import { DockSection } from "./sections/dock-section";
import { GeneralSection } from "./sections/general-section";
import { StorageSection } from "./sections/storage-section";
import { AccessibilitySection } from "./sections/accessibility-section";

type SectionId = "wallpaper" | "appearance" | "dock" | "accessibility" | "storage" | "general";

const SECTIONS: Array<{ id: SectionId; label: string; iconPath: string }> = [
  {
    id: "wallpaper",
    label: "Wallpaper",
    iconPath:
      "M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm0 9l4-4 3 3 4-5 5 6H3z",
  },
  {
    id: "appearance",
    label: "Appearance",
    iconPath:
      "M12 3a9 9 0 100 18A9 9 0 0012 3zm0 2v14a7 7 0 000-14z",
  },
  {
    id: "dock",
    label: "Dock & Menu Bar",
    iconPath:
      "M3 16h18M7 12h.01M12 12h.01M17 12h.01M5 20h14a2 2 0 002-2v-1H3v1a2 2 0 002 2z",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    iconPath:
      "M12 2a2 2 0 110 4 2 2 0 010-4zm-1 6h2l1 4-2 1v5h-2v-5l-2-1 1-4z",
  },
  {
    id: "storage",
    label: "Storage",
    iconPath:
      "M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm2 3h12M8 7v2m4-2v2m4-2v2",
  },
  {
    id: "general",
    label: "General",
    iconPath:
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

export function SettingsApp({}: AppComponentProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("wallpaper");

  const {
    osSettings,
    wallpaperId,
    customWallpaperDataUrl,
    processCount,
    windowCount,
    fsNodeCount,
    updateSettings,
    setWallpaperId,
    setCustomWallpaper,
    exportVfs,
    clearVfs,
    resetSettings,
  } = useSettingsApp();

  return (
    <div className="flex h-full overflow-hidden rounded-[24px] bg-window">
      {/* Sidebar */}
      <aside className="flex w-[210px] shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border/60 bg-surface/50 p-3 backdrop-blur-xl">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
          Preferences
        </p>
        {SECTIONS.map((section) => {
          const isActive = section.id === activeSection;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition duration-200",
                isActive
                  ? "bg-accent text-white shadow-[0_2px_8px_rgba(10,132,255,0.25)]"
                  : "text-foreground hover:bg-surface",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition duration-200",
                  isActive ? "bg-white/20" : "bg-surface",
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={section.iconPath} />
                </svg>
              </span>
              <span className="truncate">{section.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Content */}
      <div className="relative min-w-0 flex-1 overflow-y-auto bg-background/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="h-full"
          >
            {activeSection === "wallpaper" && (
              <WallpaperSection
                wallpaperId={wallpaperId}
                customWallpaperDataUrl={customWallpaperDataUrl}
                setWallpaperId={setWallpaperId}
                setCustomWallpaper={setCustomWallpaper}
              />
            )}
            {activeSection === "appearance" && (
              <AppearanceSection osSettings={osSettings} updateSettings={updateSettings} />
            )}
            {activeSection === "dock" && (
              <DockSection osSettings={osSettings} updateSettings={updateSettings} />
            )}
            {activeSection === "accessibility" && (
              <AccessibilitySection osSettings={osSettings} updateSettings={updateSettings} />
            )}
            {activeSection === "storage" && (
              <StorageSection
                fsNodeCount={fsNodeCount}
                exportVfs={exportVfs}
                clearVfs={clearVfs}
              />
            )}
            {activeSection === "general" && (
              <GeneralSection
                processCount={processCount}
                windowCount={windowCount}
                fsNodeCount={fsNodeCount}
                resetSettings={resetSettings}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
