"use client";

import type { UseSettingsAppResult } from "../../model/use-settings-app";

type StorageSectionProps = Pick<
  UseSettingsAppResult,
  "fsNodeCount" | "exportVfs" | "clearVfs"
>;

export function StorageSection({ fsNodeCount, exportVfs, clearVfs }: StorageSectionProps) {
  const handleClear = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "This will permanently delete all files in the virtual file system and reload PortOS. This cannot be undone. Continue?",
      )
    ) {
      void clearVfs();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Storage</h2>
        <p className="mt-1 text-sm text-muted">
          Manage the PortOS virtual file system stored in your browser.
        </p>
      </div>

      {/* VFS Stats */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Virtual File System</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Total Nodes</span>
            <span className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-foreground">
              {fsNodeCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Storage Backend</span>
            <span className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-foreground">
              IndexedDB
            </span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="text-sm font-semibold text-foreground">Export File System</p>
        <p className="mt-1 text-xs text-muted">
          Download a JSON snapshot of all files and directories.
        </p>
        <button
          type="button"
          onClick={() => void exportVfs()}
          className="mt-4 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition duration-200 hover:bg-accent hover:text-white hover:border-accent"
        >
          Export VFS
        </button>
      </div>

      {/* Clear */}
      <div className="rounded-2xl border border-red-200/60 bg-red-50/40 p-5 dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Clear File System</p>
        <p className="mt-1 text-xs text-red-600/70 dark:text-red-500/70">
          Permanently deletes all files, directories, and stored data. PortOS will reload.
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-700 dark:bg-red-950/40 dark:text-red-400"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
