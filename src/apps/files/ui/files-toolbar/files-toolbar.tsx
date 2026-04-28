"use client";

import {
  ArrowLeft,
  ArrowUp,
  Eye,
  EyeOff,
  FilePlus,
  FolderPlus,
  Grid3X3,
  List,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/shared/lib";

import type { FilesViewMode } from "../../model/use-files-app";

type FilesToolbarProps = {
  viewMode: FilesViewMode;
  searchQuery: string;
  showHidden: boolean;
  canGoUp: boolean;
  canCreate: boolean;
  onSetViewMode: (mode: FilesViewMode) => void;
  onSetSearchQuery: (query: string) => void;
  onClearSearch: () => void;
  onToggleHidden: () => void;
  onNavigateUp: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
};

export function FilesToolbar({
  viewMode,
  searchQuery,
  showHidden,
  canGoUp,
  canCreate,
  onSetViewMode,
  onSetSearchQuery,
  onClearSearch,
  onToggleHidden,
  onNavigateUp,
  onCreateFile,
  onCreateFolder,
}: FilesToolbarProps) {
  return (
    <div className="flex h-[var(--files-toolbar-height)] items-center gap-1 border-b border-files-border px-2">
      {/* Navigation */}
      <button
        type="button"
        onClick={onNavigateUp}
        disabled={!canGoUp}
        title="Go up"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          canGoUp
            ? "text-files-text-secondary hover:bg-files-hover hover:text-files-text"
            : "cursor-not-allowed text-files-text-secondary/40",
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      {/* Separator */}
      <div className="mx-1 h-4 w-px bg-files-border" />

      {/* Create actions */}
      {canCreate && (
        <>
          <button
            type="button"
            onClick={onCreateFile}
            title="New file"
            className="flex h-7 w-7 items-center justify-center rounded-md text-files-text-secondary transition-colors hover:bg-files-hover hover:text-files-text"
          >
            <FilePlus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onCreateFolder}
            title="New folder"
            className="flex h-7 w-7 items-center justify-center rounded-md text-files-text-secondary transition-colors hover:bg-files-hover hover:text-files-text"
          >
            <FolderPlus className="h-4 w-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-files-border" />
        </>
      )}

      {/* Toggle hidden */}
      <button
        type="button"
        onClick={onToggleHidden}
        title={showHidden ? "Hide hidden files" : "Show hidden files"}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          showHidden
            ? "bg-files-accent-light text-files-accent"
            : "text-files-text-secondary hover:bg-files-hover hover:text-files-text",
        )}
      >
        {showHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>

      {/* View mode */}
      <div className="flex rounded-md border border-files-border">
        <button
          type="button"
          onClick={() => onSetViewMode("grid")}
          title="Grid view"
          className={cn(
            "flex h-6 w-7 items-center justify-center rounded-l-md transition-colors",
            viewMode === "grid"
              ? "bg-files-accent text-white"
              : "text-files-text-secondary hover:bg-files-hover",
          )}
        >
          <Grid3X3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onSetViewMode("list")}
          title="List view"
          className={cn(
            "flex h-6 w-7 items-center justify-center rounded-r-md transition-colors",
            viewMode === "list"
              ? "bg-files-accent text-white"
              : "text-files-text-secondary hover:bg-files-hover",
          )}
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-3.5 w-3.5 text-files-text-secondary" />
        <input
          value={searchQuery}
          onChange={(e) => onSetSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="h-7 w-44 rounded-md border border-files-border bg-white pl-7 pr-7 text-[12px] text-files-text outline-none placeholder:text-files-text-secondary focus:border-files-accent focus:ring-1 focus:ring-files-accent/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-files-text-secondary hover:text-files-text"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
