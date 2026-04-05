"use client";

import {
  Save,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Heading2,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Eye,
  EyeOff,
  Braces,
  FileText,
} from "lucide-react";
import { cn } from "@/shared/lib/cn/cn";

import type { EditorMode } from "../../model/editor.types";

// ── Types ───────────────────────────────────────────────

type EditorToolbarProps = {
  mode: EditorMode;
  isDirty: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showPreview: boolean;
  fileName: string;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onFormatJSON?: () => void;
  onInsertBold?: () => void;
  onInsertItalic?: () => void;
  onInsertHeading?: () => void;
  onInsertCode?: () => void;
  onInsertLink?: () => void;
  onInsertList?: () => void;
  onInsertOrderedList?: () => void;
  onInsertQuote?: () => void;
};

// ── Component ───────────────────────────────────────────

export function EditorToolbar({
  mode,
  isDirty,
  isSaving,
  canUndo,
  canRedo,
  showPreview,
  fileName,
  onSave,
  onUndo,
  onRedo,
  onTogglePreview,
  onFormatJSON,
  onInsertBold,
  onInsertItalic,
  onInsertHeading,
  onInsertCode,
  onInsertLink,
  onInsertList,
  onInsertOrderedList,
  onInsertQuote,
}: EditorToolbarProps) {
  return (
    <div
      className="flex items-center gap-0.5 px-2 border-b select-none shrink-0"
      style={{
        height: "var(--editor-toolbar-height)",
        background: "var(--editor-toolbar-bg)",
        borderColor: "var(--editor-border)",
      }}
    >
      {/* File info */}
      <div className="flex items-center gap-1.5 mr-2 min-w-0">
        <FileText
          size={14}
          style={{ color: "var(--editor-accent)" }}
          className="shrink-0"
        />
        <span
          className="text-xs font-medium truncate"
          style={{ color: "var(--editor-text)" }}
        >
          {fileName}
        </span>
        {isDirty && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "var(--editor-dirty-indicator)" }}
            title="Unsaved changes"
          />
        )}
      </div>

      {/* Separator */}
      <div
        className="w-px h-4 mx-1 shrink-0"
        style={{ background: "var(--editor-border)" }}
      />

      {/* Save / Undo / Redo */}
      <ToolbarButton
        icon={<Save size={14} />}
        title="Save (⌘S)"
        onClick={onSave}
        disabled={!isDirty || isSaving}
        active={false}
      />
      <ToolbarButton
        icon={<Undo2 size={14} />}
        title="Undo (⌘Z)"
        onClick={onUndo}
        disabled={!canUndo}
        active={false}
      />
      <ToolbarButton
        icon={<Redo2 size={14} />}
        title="Redo (⌘⇧Z)"
        onClick={onRedo}
        disabled={!canRedo}
        active={false}
      />

      {/* Markdown formatting */}
      {mode === "markdown" && (
        <>
          <div
            className="w-px h-4 mx-1 shrink-0"
            style={{ background: "var(--editor-border)" }}
          />
          <ToolbarButton
            icon={<Bold size={14} />}
            title="Bold (⌘B)"
            onClick={onInsertBold}
            active={false}
          />
          <ToolbarButton
            icon={<Italic size={14} />}
            title="Italic (⌘I)"
            onClick={onInsertItalic}
            active={false}
          />
          <ToolbarButton
            icon={<Heading2 size={14} />}
            title="Heading"
            onClick={onInsertHeading}
            active={false}
          />
          <ToolbarButton
            icon={<Code size={14} />}
            title="Inline Code"
            onClick={onInsertCode}
            active={false}
          />
          <ToolbarButton
            icon={<Link size={14} />}
            title="Link"
            onClick={onInsertLink}
            active={false}
          />
          <ToolbarButton
            icon={<List size={14} />}
            title="Bullet List"
            onClick={onInsertList}
            active={false}
          />
          <ToolbarButton
            icon={<ListOrdered size={14} />}
            title="Numbered List"
            onClick={onInsertOrderedList}
            active={false}
          />
          <ToolbarButton
            icon={<Quote size={14} />}
            title="Blockquote"
            onClick={onInsertQuote}
            active={false}
          />
        </>
      )}

      {/* JSON formatting */}
      {mode === "json" && (
        <>
          <div
            className="w-px h-4 mx-1 shrink-0"
            style={{ background: "var(--editor-border)" }}
          />
          <ToolbarButton
            icon={<Braces size={14} />}
            title="Format JSON"
            onClick={onFormatJSON}
            active={false}
          />
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Preview toggle (markdown only) */}
      {mode === "markdown" && (
        <ToolbarButton
          icon={showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          title={showPreview ? "Hide Preview (⌘P)" : "Show Preview (⌘P)"}
          onClick={onTogglePreview}
          active={showPreview}
        />
      )}

      {/* Saving indicator */}
      {isSaving && (
        <span
          className="text-[10px] px-1.5"
          style={{ color: "var(--editor-text-secondary)" }}
        >
          Saving…
        </span>
      )}
    </div>
  );
}

// ── Toolbar Button ──────────────────────────────────────

function ToolbarButton({
  icon,
  title,
  onClick,
  disabled = false,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  active: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-md transition-colors",
        "disabled:opacity-30 disabled:cursor-default",
      )}
      style={{
        color: active ? "var(--editor-accent)" : "var(--editor-text-secondary)",
        background: active ? "var(--editor-accent-light)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = active
            ? "var(--editor-accent-light)"
            : "var(--editor-hover)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active
          ? "var(--editor-accent-light)"
          : "transparent";
      }}
    >
      {icon}
    </button>
  );
}
