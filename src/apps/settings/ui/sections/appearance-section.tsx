"use client";

import { cn } from "@/shared/lib";
import { ACCENT_COLOR_MAP, type ColorScheme, type AccentColor } from "../../model/settings.types";
import type { UseSettingsAppResult } from "../../model/use-settings-app";

type AppearanceSectionProps = Pick<UseSettingsAppResult, "osSettings" | "updateSettings">;

const COLOR_SCHEME_OPTIONS: Array<{ id: ColorScheme; label: string }> = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "Auto" },
];

export function AppearanceSection({ osSettings, updateSettings }: AppearanceSectionProps) {
  const { colorScheme, accentColor, reduceTransparency } = osSettings;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Appearance</h2>
        <p className="mt-1 text-sm text-muted">Customize the look and feel of PortOS.</p>
      </div>

      {/* Color Scheme */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="text-sm font-semibold text-foreground">Appearance</p>
        <p className="mt-1 text-xs text-muted">Choose how PortOS looks to you.</p>
        <div className="mt-4 flex gap-3">
          {COLOR_SCHEME_OPTIONS.map((option) => {
            const isSelected = colorScheme === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => void updateSettings({ colorScheme: option.id })}
                className={cn(
                  "flex h-16 w-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 text-xs font-semibold transition duration-200",
                  option.id === "light" && "bg-white text-slate-700",
                  option.id === "dark" && "bg-[#1c1c1e] text-slate-300",
                  option.id === "system" && "bg-gradient-to-br from-white to-[#1c1c1e] text-slate-500",
                  isSelected
                    ? "border-accent shadow-[0_2px_12px_rgba(10,132,255,0.2)]"
                    : "border-border hover:border-accent/40",
                )}
              >
                <span className="text-base leading-none">
                  {option.id === "light" ? "☀️" : option.id === "dark" ? "🌙" : "⚡"}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="text-sm font-semibold text-foreground">Accent Color</p>
        <p className="mt-1 text-xs text-muted">Used for buttons, selection indicators, and highlights.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(Object.entries(ACCENT_COLOR_MAP) as Array<[AccentColor, { label: string; value: string }]>).map(
            ([id, { label, value }]) => {
              const isSelected = accentColor === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => void updateSettings({ accentColor: id })}
                  title={label}
                  aria-label={`Set accent color to ${label}`}
                  className={cn(
                    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 transition duration-200",
                    isSelected ? "border-foreground/60 scale-110" : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: value }}
                >
                  {isSelected && (
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8.5l3.5 3.5 6.5-7" />
                    </svg>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Reduce Transparency */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Reduce Transparency</p>
            <p className="mt-0.5 text-xs text-muted">
              Disables backdrop blur and replaces translucent surfaces with solid ones.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reduceTransparency}
            onClick={() => void updateSettings({ reduceTransparency: !reduceTransparency })}
            className={cn(
              "relative flex h-7 w-12 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
              reduceTransparency ? "bg-accent" : "bg-muted/30",
            )}
          >
            <span
              className={cn(
                "absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                reduceTransparency ? "translate-x-[calc(100%-1px)]" : "translate-x-0.5",
              )}
            />
            <span className="sr-only">{reduceTransparency ? "On" : "Off"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
