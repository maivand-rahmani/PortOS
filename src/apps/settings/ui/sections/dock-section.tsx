"use client";

import { cn } from "@/shared/lib";
import { DOCK_ICON_SIZE_MAP, type DockIconSize } from "../../model/settings.types";
import type { UseSettingsAppResult } from "../../model/use-settings-app";

type DockSectionProps = Pick<UseSettingsAppResult, "osSettings" | "updateSettings">;

const ICON_SIZES: DockIconSize[] = ["small", "medium", "large"];

export function DockSection({ osSettings, updateSettings }: DockSectionProps) {
  const { dockIconSize, dockAutohide } = osSettings;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Dock &amp; Menu Bar</h2>
        <p className="mt-1 text-sm text-muted">Configure dock behavior and appearance.</p>
      </div>

      {/* Icon Size */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="text-sm font-semibold text-foreground">Dock Icon Size</p>
        <p className="mt-1 text-xs text-muted">Adjust the size of dock icons.</p>
        <div className="mt-4 flex gap-2 rounded-xl bg-surface p-1">
          {ICON_SIZES.map((size) => {
            const isSelected = dockIconSize === size;
            const { label } = DOCK_ICON_SIZE_MAP[size];

            return (
              <button
                key={size}
                type="button"
                onClick={() => void updateSettings({ dockIconSize: size })}
                className={cn(
                  "flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition duration-200",
                  isSelected
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Preview */}
        <div className="mt-4 flex items-end gap-2">
          {ICON_SIZES.map((size) => {
            const { px } = DOCK_ICON_SIZE_MAP[size];
            const isSelected = dockIconSize === size;

            return (
              <div
                key={size}
                className={cn(
                  "rounded-[14px] border transition-all duration-200",
                  isSelected
                    ? "border-accent bg-accent/20"
                    : "border-border bg-surface",
                )}
                style={{ width: px * 0.7, height: px * 0.7 }}
              />
            );
          })}
          <span className="ml-1 text-xs text-muted">
            {DOCK_ICON_SIZE_MAP[dockIconSize].px}px
          </span>
        </div>
      </div>

      {/* Autohide */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Automatically hide the Dock</p>
            <p className="mt-0.5 text-xs text-muted">
              The Dock slides out of view when the pointer moves away.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dockAutohide}
            onClick={() => void updateSettings({ dockAutohide: !dockAutohide })}
            className={cn(
              "relative flex h-7 w-12 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
              dockAutohide ? "bg-accent" : "bg-muted/30",
            )}
          >
            <span
              className={cn(
                "absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                dockAutohide ? "translate-x-[calc(100%-1px)]" : "translate-x-0.5",
              )}
            />
            <span className="sr-only">{dockAutohide ? "On" : "Off"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
