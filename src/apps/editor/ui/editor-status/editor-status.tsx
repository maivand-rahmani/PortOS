"use client";

import { Clock, FileText, Type } from "lucide-react";

import type { EditorMode } from "../../model/editor.types";

// ── Types ───────────────────────────────────────────────

type EditorStatusProps = {
  mode: EditorMode;
  wordCount: number;
  lineCount: number;
  charCount: number;
  isDirty: boolean;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSavedAt: string | null;
  filePath: string;
  jsonValid?: { valid: boolean; error: string | null } | null;
  onToggleAutoSave: () => void;
};

// ── Helpers ─────────────────────────────────────────────

function formatLastSaved(iso: string | null): string {
  if (!iso) {
    return "";
  }

  try {
    const date = new Date(iso);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const MODE_LABELS: Record<EditorMode, string> = {
  plaintext: "Plain Text",
  markdown: "Markdown",
  json: "JSON",
  code: "Code",
};

// ── Component ───────────────────────────────────────────

export function EditorStatus({
  mode,
  wordCount,
  lineCount,
  charCount,
  isDirty,
  isSaving,
  autoSaveEnabled,
  lastSavedAt,
  filePath,
  jsonValid,
  onToggleAutoSave,
}: EditorStatusProps) {
  const savedLabel = formatLastSaved(lastSavedAt);

  return (
    <div
      className="flex items-center gap-3 px-3 border-t select-none shrink-0"
      style={{
        height: "var(--editor-status-height)",
        background: "var(--editor-status-bg)",
        borderColor: "var(--editor-border)",
        color: "var(--editor-text-secondary)",
        fontSize: 11,
      }}
    >
      {/* File path */}
      <div className="flex items-center gap-1 min-w-0">
        <FileText size={10} className="shrink-0" />
        <span className="truncate max-w-[200px]">{filePath}</span>
      </div>

      {/* Separator */}
      <div className="w-px h-3" style={{ background: "var(--editor-border)" }} />

      {/* Mode */}
      <span>{MODE_LABELS[mode]}</span>

      {/* Separator */}
      <div className="w-px h-3" style={{ background: "var(--editor-border)" }} />

      {/* Stats */}
      <div className="flex items-center gap-1">
        <Type size={10} />
        <span>{wordCount} words</span>
      </div>
      <span>{lineCount} lines</span>
      <span>{charCount} chars</span>

      {/* JSON validation status */}
      {mode === "json" && jsonValid && (
        <>
          <div
            className="w-px h-3"
            style={{ background: "var(--editor-border)" }}
          />
          <span
            style={{
              color: jsonValid.valid
                ? "var(--editor-saved-indicator)"
                : "#ef4444",
            }}
          >
            {jsonValid.valid ? "Valid JSON" : "Invalid JSON"}
          </span>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save status */}
      {isSaving ? (
        <span>Saving…</span>
      ) : isDirty ? (
        <div className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--editor-dirty-indicator)" }}
          />
          <span>Modified</span>
        </div>
      ) : savedLabel ? (
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>Saved {savedLabel}</span>
        </div>
      ) : null}

      {/* Auto-save toggle */}
      <button
        type="button"
        onClick={onToggleAutoSave}
        className="px-1.5 py-0.5 rounded text-[10px] transition-colors"
        style={{
          background: autoSaveEnabled
            ? "var(--editor-accent-light)"
            : "transparent",
          color: autoSaveEnabled
            ? "var(--editor-accent)"
            : "var(--editor-text-secondary)",
        }}
        title={autoSaveEnabled ? "Auto-save ON" : "Auto-save OFF"}
      >
        Auto
      </button>
    </div>
  );
}
