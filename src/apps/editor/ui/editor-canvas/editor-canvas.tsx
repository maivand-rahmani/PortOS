"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";

import type { EditorMode } from "../../model/editor.types";

// ── Types ───────────────────────────────────────────────

type EditorCanvasProps = {
  content: string;
  mode: EditorMode;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onContentChange: (content: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onSelect?: () => void;
  showLineNumbers?: boolean;
};

// ── Component ───────────────────────────────────────────

export function EditorCanvas({
  content,
  mode,
  textareaRef,
  onContentChange,
  onKeyDown,
  onSelect,
  showLineNumbers = true,
}: EditorCanvasProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const lineCount = content === "" ? 1 : content.split("\n").length;

  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;

    if (textarea && lineNumbers) {
      lineNumbers.scrollTop = textarea.scrollTop;
    }
  }, [textareaRef]);

  // Auto-focus textarea on mount
  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      // Delay focus to avoid interfering with window focus mechanics
      const timer = setTimeout(() => {
        textarea.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [textareaRef]);

  // Handle tab key for indentation
  const handleKeyDownInternal = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Tab") {
        event.preventDefault();

        const textarea = event.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newContent =
          content.slice(0, start) + "  " + content.slice(end);

        onContentChange(newContent);

        requestAnimationFrame(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = start + 2;
        });

        return;
      }

      onKeyDown(event);
    },
    [content, onContentChange, onKeyDown],
  );

  return (
    <div
      className="flex flex-1 min-h-0 overflow-hidden"
      style={{ background: "var(--editor-canvas-bg)" }}
    >
      {/* Line numbers */}
      {showLineNumbers && (
        <div
          ref={lineNumbersRef}
          className="shrink-0 overflow-hidden select-none text-right pr-2 pt-3 pb-3"
          style={{
            width: lineCount >= 1000 ? 56 : lineCount >= 100 ? 48 : 40,
            background: "var(--editor-gutter-bg)",
            borderRight: "1px solid var(--editor-border)",
            color: "var(--editor-line-number)",
            fontSize: 12,
            lineHeight: "20px",
            fontFamily: "var(--font-industrial-mono, monospace)",
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="px-1">
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDownInternal}
        onSelect={onSelect}
        spellCheck={mode === "plaintext" || mode === "markdown"}
        className="flex-1 resize-none outline-none p-3 min-h-0"
        style={{
          background: "transparent",
          color: "var(--editor-text)",
          caretColor: "var(--editor-caret)",
          fontSize: 13,
          lineHeight: "20px",
          fontFamily:
            mode === "json" || mode === "code"
              ? "var(--font-industrial-mono, monospace)"
              : "inherit",
          tabSize: 2,
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      />
    </div>
  );
}
