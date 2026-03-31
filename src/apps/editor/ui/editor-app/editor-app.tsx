"use client";

import type { AppComponentProps } from "@/entities/app";

import { useEditor } from "../../model/use-editor";
import { EditorToolbar } from "../editor-toolbar/editor-toolbar";
import { EditorCanvas } from "../editor-canvas/editor-canvas";
import { EditorPreview } from "../editor-preview/editor-preview";
import { EditorStatus } from "../editor-status/editor-status";

// ── Component ───────────────────────────────────────────

export function EditorApp({ processId, windowId }: AppComponentProps) {
  const editor = useEditor(processId, windowId);

  // ── Loading state ───────────────────────────────────

  if (!editor.fsHydrated || editor.isLoading) {
    return (
      <div
        className="editor-app flex flex-col items-center justify-center w-full h-full select-none"
        style={{ background: "var(--editor-bg)" }}
      >
        <div
          className="text-sm animate-pulse"
          style={{ color: "var(--editor-text-secondary)" }}
        >
          Loading…
        </div>
      </div>
    );
  }

  // ── Empty state (no file open) ──────────────────────

  if (!editor.document) {
    return (
      <div
        className="editor-app flex flex-col items-center justify-center w-full h-full select-none gap-2"
        style={{ background: "var(--editor-bg)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "var(--editor-accent-light)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6"
            style={{ color: "var(--editor-accent)" }}
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2v6h6M8 13h8M8 17h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--editor-text)" }}
        >
          No file open
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--editor-text-secondary)" }}
        >
          Open a file from the Files app to start editing.
        </span>

        {editor.error && (
          <div
            className="mt-3 px-3 py-1.5 rounded-md text-xs"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
            }}
          >
            {editor.error}
          </div>
        )}
      </div>
    );
  }

  // ── Editor layout ───────────────────────────────────

  const isMarkdownSplit =
    editor.document.mode === "markdown" && editor.showPreview;

  return (
    <div
      className="editor-app flex flex-col w-full h-full overflow-hidden"
      style={{ background: "var(--editor-bg)" }}
      onKeyDown={editor.handleKeyDown}
    >
      {/* Toolbar */}
      <EditorToolbar
        mode={editor.document.mode}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        showPreview={editor.showPreview}
        fileName={editor.document.name}
        onSave={editor.save}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onTogglePreview={editor.togglePreview}
        onFormatJSON={editor.formatJSON}
        onInsertBold={editor.insertBold}
        onInsertItalic={editor.insertItalic}
        onInsertHeading={editor.insertHeading}
        onInsertCode={editor.insertCode}
        onInsertLink={editor.insertLink}
        onInsertList={editor.insertList}
        onInsertOrderedList={editor.insertOrderedList}
        onInsertQuote={editor.insertQuote}
      />

      {/* Error banner */}
      {editor.error && (
        <button
          type="button"
          onClick={editor.clearError}
          className="flex items-center gap-2 px-3 py-1.5 text-xs border-b shrink-0 text-left w-full"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            borderColor: "rgba(239, 68, 68, 0.2)",
            color: "#ef4444",
          }}
        >
          <span className="flex-1">{editor.error}</span>
          <span style={{ opacity: 0.5 }}>Click to dismiss</span>
        </button>
      )}

      {/* Main editing area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <EditorCanvas
          content={editor.document.content}
          mode={editor.document.mode}
          textareaRef={editor.textareaRef}
          onContentChange={editor.updateContent}
          onKeyDown={editor.handleKeyDown}
          showLineNumbers={
            editor.document.mode === "code" ||
            editor.document.mode === "json" ||
            !isMarkdownSplit
          }
        />

        {isMarkdownSplit && (
          <EditorPreview content={editor.document.content} />
        )}
      </div>

      {/* Status bar */}
      <EditorStatus
        mode={editor.document.mode}
        wordCount={editor.wordCount}
        lineCount={editor.lineCount}
        charCount={editor.charCount}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        autoSaveEnabled={editor.autoSaveEnabled}
        lastSavedAt={editor.lastSavedAt}
        filePath={editor.document.path}
        jsonValid={editor.validateJSON}
        onToggleAutoSave={editor.toggleAutoSave}
      />
    </div>
  );
}
