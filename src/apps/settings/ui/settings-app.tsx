"use client";

import { useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import {
  WALLPAPERS,
  type Wallpaper,
} from "@/shared/lib/wallpapers";

type SettingsSection = "general" | "wallpaper" | "appearance" | "dock";

const SECTIONS: Array<{ id: SettingsSection; label: string; icon: string }> = [
  { id: "general", label: "General", icon: "⚙️" },
  { id: "wallpaper", label: "Wallpaper", icon: "🖼" },
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "dock", label: "Dock & Menu Bar", icon: "📌" },
];

export function SettingsApp({}: AppComponentProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("wallpaper");

  return (
    <div className="settings-app flex h-full gap-0 overflow-hidden rounded-[24px]">
      <aside className="flex w-[220px] shrink-0 flex-col gap-1 overflow-auto border-r border-indigo-100/60 bg-white/50 p-3">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Settings
        </p>
        {SECTIONS.map((section) => {
          const isActive = section.id === activeSection;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition duration-200 ${
                isActive
                  ? "bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base transition duration-200 ${
                  isActive ? "bg-white/20" : "bg-indigo-100/60"
                }`}
              >
                {section.icon}
              </span>
              {section.label}
            </button>
          );
        })}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-auto bg-white/40">
        {activeSection === "wallpaper" ? (
          <WallpaperSection />
        ) : activeSection === "general" ? (
          <GeneralSection />
        ) : activeSection === "appearance" ? (
          <AppearanceSection />
        ) : (
          <DockSection />
        )}
      </section>
    </div>
  );
}

function WallpaperSection() {
  const selectedId = useOSStore((state) => state.wallpaperId);
  const setWallpaper = useOSStore((state) => state.setWallpaper);

  const handleSelect = (wallpaper: Wallpaper) => {
    setWallpaper(wallpaper.id);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Wallpaper</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a desktop background for your PortOS.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {WALLPAPERS.map((wallpaper) => {
          const isSelected = wallpaper.id === selectedId;

          return (
            <button
              key={wallpaper.id}
              type="button"
              onClick={() => handleSelect(wallpaper)}
              className={`group cursor-pointer overflow-hidden rounded-2xl border-2 transition duration-200 ${
                isSelected
                  ? "border-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
                  : "border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:border-indigo-300 hover:shadow-[0_4px_16px_rgba(99,102,241,0.15)]"
              }`}
            >
              <div
                className="relative aspect-[4/3] w-full"
                style={{ background: wallpaper.gradient }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: wallpaper.overlay }}
                />
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
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg">
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-4 w-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 8.5l3.5 3.5 6.5-7" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-white/80 px-3 py-2 text-center">
                <span className="text-xs font-semibold text-slate-700">
                  {wallpaper.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GeneralSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">General</h2>
        <p className="mt-1 text-sm text-slate-500">
          General system preferences.
        </p>
      </div>
      <div className="rounded-2xl border border-indigo-100/60 bg-white/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">System Name</p>
            <p className="text-xs text-slate-500">The name of this operating system</p>
          </div>
          <span className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
            PortOS
          </span>
        </div>
      </div>
      <div className="rounded-2xl border border-indigo-100/60 bg-white/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Version</p>
            <p className="text-xs text-slate-500">Current system version</p>
          </div>
          <span className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
            1.0.0
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        More general settings coming soon.
      </p>
    </div>
  );
}

function AppearanceSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Appearance</h2>
        <p className="mt-1 text-sm text-slate-500">
          Customize the look and feel.
        </p>
      </div>
      <div className="rounded-2xl border border-indigo-100/60 bg-white/60 p-5">
        <p className="text-sm font-semibold text-slate-800">Theme</p>
        <p className="mt-1 text-xs text-slate-500">
          Light mode is currently active. Dark mode coming soon.
        </p>
        <div className="mt-4 flex gap-3">
          <div className="flex h-16 w-20 items-center justify-center rounded-2xl border-2 border-indigo-500 bg-white shadow-md">
            <span className="text-xs font-bold text-indigo-600">Light</span>
          </div>
          <div className="flex h-16 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 opacity-50">
            <span className="text-xs font-bold text-slate-400">Dark</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        More appearance settings coming soon.
      </p>
    </div>
  );
}

function DockSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Dock & Menu Bar</h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure dock behavior and menu bar options.
        </p>
      </div>
      <div className="rounded-2xl border border-indigo-100/60 bg-white/60 p-5">
        <p className="text-sm font-semibold text-slate-800">Dock Size</p>
        <p className="mt-1 text-xs text-slate-500">
          Adjust the size of dock icons.
        </p>
        <div className="mt-4 h-2 w-full rounded-full bg-indigo-100">
          <div className="h-2 w-3/5 rounded-full bg-indigo-500" />
        </div>
      </div>
      <p className="text-xs text-slate-400">
        More dock settings coming soon.
      </p>
    </div>
  );
}
