"use client";

import type { UseSettingsAppResult } from "../../model/use-settings-app";

type GeneralSectionProps = Pick<
  UseSettingsAppResult,
  "processCount" | "windowCount" | "fsNodeCount" | "resetSettings"
>;

export function GeneralSection({
  processCount,
  windowCount,
  fsNodeCount,
  resetSettings,
}: GeneralSectionProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">General</h2>
        <p className="mt-1 text-sm text-muted">System information and settings management.</p>
      </div>

      {/* System Info */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">System</p>
        <div className="flex flex-col gap-3">
          <Row label="Name" value="PortOS" />
          <Row label="Version" value="1.0.0" />
          <Row label="Build" value="browser-os" />
          <Row label="Architecture" value="web-runtime" />
        </div>
      </div>

      {/* Runtime Stats */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Runtime</p>
        <div className="flex flex-col gap-3">
          <Row label="Running Processes" value={String(processCount)} />
          <Row label="Open Windows" value={String(windowCount)} />
          <Row label="File System Nodes" value={String(fsNodeCount)} />
        </div>
      </div>

      {/* Reset */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="text-sm font-semibold text-foreground">Reset Settings</p>
        <p className="mt-1 text-xs text-muted">
          Restores all appearance and dock settings to defaults. Your files are not affected.
        </p>
        <button
          type="button"
          onClick={() => void resetSettings()}
          className="mt-4 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition duration-200 hover:bg-accent hover:text-white hover:border-accent"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}
