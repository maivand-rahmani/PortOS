"use client";

import { cn } from "@/shared/lib";
import type { UseSettingsAppResult } from "../../model/use-settings-app";

type AccessibilitySectionProps = Pick<UseSettingsAppResult, "osSettings" | "updateSettings">;

export function AccessibilitySection({ osSettings, updateSettings }: AccessibilitySectionProps) {
  const { reduceMotion, reduceTransparency } = osSettings;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Accessibility</h2>
        <p className="mt-1 text-sm text-muted">
          Reduce visual effects to improve comfort and performance.
        </p>
      </div>

      {/* Reduce Motion */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Reduce Motion</p>
            <p className="mt-0.5 text-xs text-muted">
              Limits animations and transitions throughout the interface.
            </p>
          </div>
          <Toggle
            checked={reduceMotion}
            onChange={(next) => void updateSettings({ reduceMotion: next })}
          />
        </div>
      </div>

      {/* Reduce Transparency */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Reduce Transparency</p>
            <p className="mt-0.5 text-xs text-muted">
              Replaces translucent surfaces with solid ones and removes backdrop blur effects.
            </p>
          </div>
          <Toggle
            checked={reduceTransparency}
            onChange={(next) => void updateSettings({ reduceTransparency: next })}
          />
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative flex h-7 w-12 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-accent" : "bg-muted/30",
      )}
    >
      <span
        className={cn(
          "absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[calc(100%-1px)]" : "translate-x-0.5",
        )}
      />
      <span className="sr-only">{checked ? "On" : "Off"}</span>
    </button>
  );
}
