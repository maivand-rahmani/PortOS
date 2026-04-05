"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FileNode } from "@/entities/file-system";
import { getNodePath } from "@/processes/os/model/file-system";
import { useOSStore } from "@/processes";
import {
  consumeOpenFileRequest,
  FS_EVENTS,
} from "@/shared/lib/os-events/fs-os-events";

import {
  type EditorState,
  type UndoEntry,
  INITIAL_EDITOR_STATE,
  MAX_UNDO_STACK,
  UNDO_DEBOUNCE_MS,
  AUTO_SAVE_DELAY_MS,
  computeTextStats,
  createEditorDocument,
} from "./editor.types";

// ── Hook ────────────────────────────────────────────────

export function useEditor(processId: string, windowId: string) {
  const fsNodeMap = useOSStore((s) => s.fsNodeMap);
  const fsHydrated = useOSStore((s) => s.fsHydrated);
  const fsReadContent = useOSStore((s) => s.fsReadContent);
  const fsWriteContent = useOSStore((s) => s.fsWriteContent);
  const fsSetActiveFile = useOSStore((s) => s.fsSetActiveFile);

  const [state, setState] = useState<EditorState>(INITIAL_EDITOR_STATE);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUndoPushRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasMountedRef = useRef(false);

  // ── Open File ────────────────────────────────────────

  const openFile = useCallback(
    async (nodeId: string) => {
      const node = fsNodeMap[nodeId];

      if (!node || node.type !== "file") {
        setState((prev) => ({
          ...prev,
          error: "File not found.",
          isLoading: false,
        }));

        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const content = (await fsReadContent(nodeId)) ?? "";
        const path = getNodePath(nodeId, fsNodeMap);
        const doc = createEditorDocument(node as FileNode, path, content);
        const stats = computeTextStats(content);

        setState((prev) => ({
          ...prev,
          document: doc,
          isLoading: false,
          isDirty: false,
          undoStack: [],
          redoStack: [],
          showPreview: doc.mode === "markdown",
          ...stats,
          lastSavedAt: null,
          error: null,
        }));

        fsSetActiveFile(nodeId);
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load file.",
        }));
      }
    },
    [fsNodeMap, fsReadContent, fsSetActiveFile],
  );

  // ── Consume OpenFileRequest on mount ─────────────────

  useEffect(() => {
    if (!fsHydrated || hasMountedRef.current) {
      return;
    }

    hasMountedRef.current = true;

    const request = consumeOpenFileRequest(windowId);

    if (request) {
      openFile(request.nodeId);
    }
  }, [fsHydrated, windowId, openFile]);

  // Listen for open file events dispatched after mount
  useEffect(() => {
    function handleOpenFile() {
      const request = consumeOpenFileRequest(windowId);

      if (request) {
        openFile(request.nodeId);
      }
    }

    window.addEventListener(FS_EVENTS.OPEN_FILE, handleOpenFile);

    return () => {
      window.removeEventListener(FS_EVENTS.OPEN_FILE, handleOpenFile);
    };
  }, [windowId, openFile]);

  // ── Save ─────────────────────────────────────────────

  const save = useCallback(async () => {
    if (!state.document || !state.isDirty) {
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      await fsWriteContent(state.document.nodeId, state.document.content);

      setState((prev) => ({
        ...prev,
        isSaving: false,
        isDirty: false,
        lastSavedAt: new Date().toISOString(),
        document: prev.document
          ? {
              ...prev.document,
              savedContent: prev.document.content,
              version: prev.document.version + 1,
            }
          : null,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: "Failed to save file.",
      }));
    }
  }, [state.document, state.isDirty, fsWriteContent]);

  // ── Auto-save ────────────────────────────────────────

  useEffect(() => {
    if (!state.autoSaveEnabled || !state.isDirty || !state.document) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      save();
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [state.autoSaveEnabled, state.isDirty, state.document?.content, save]);

  // ── Save on unmount if dirty ─────────────────────────

  const stateRef = useRef(state);
  stateRef.current = state;

  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    return () => {
      if (stateRef.current.isDirty && stateRef.current.document) {
        // Fire-and-forget save on unmount
        const { document } = stateRef.current;

        fsWriteContent(document.nodeId, document.content);
      }

      fsSetActiveFile(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Push to undo stack (debounced) ───────────────────

  const pushUndo = useCallback((content: string) => {
    const now = Date.now();

    if (now - lastUndoPushRef.current < UNDO_DEBOUNCE_MS) {
      // Replace the timer so only the last version within debounce window is pushed
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }

      undoTimerRef.current = setTimeout(() => {
        lastUndoPushRef.current = Date.now();

        setState((prev) => {
          const entry: UndoEntry = {
            content,
            timestamp: Date.now(),
          };

          const undoStack = [entry, ...prev.undoStack].slice(0, MAX_UNDO_STACK);

          return { ...prev, undoStack, redoStack: [] };
        });
      }, UNDO_DEBOUNCE_MS);

      return;
    }

    lastUndoPushRef.current = now;

    setState((prev) => {
      const entry: UndoEntry = {
        content,
        timestamp: now,
      };

      const undoStack = [entry, ...prev.undoStack].slice(0, MAX_UNDO_STACK);

      return { ...prev, undoStack, redoStack: [] };
    });
  }, []);

  // ── Update Content ───────────────────────────────────

  const updateContent = useCallback(
    (newContent: string) => {
      setState((prev) => {
        if (!prev.document) {
          return prev;
        }

        // Push current content to undo before changing
        pushUndo(prev.document.content);

        const stats = computeTextStats(newContent);
        const isDirty = newContent !== prev.document.savedContent;

        return {
          ...prev,
          document: { ...prev.document, content: newContent },
          isDirty,
          ...stats,
        };
      });
    },
    [pushUndo],
  );

  // ── Undo / Redo ──────────────────────────────────────

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.undoStack.length === 0 || !prev.document) {
        return prev;
      }

      const [entry, ...rest] = prev.undoStack;
      const redoEntry: UndoEntry = {
        content: prev.document.content,
        timestamp: Date.now(),
      };
      const stats = computeTextStats(entry.content);
      const isDirty = entry.content !== prev.document.savedContent;

      return {
        ...prev,
        document: { ...prev.document, content: entry.content },
        undoStack: rest,
        redoStack: [redoEntry, ...prev.redoStack],
        isDirty,
        ...stats,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.redoStack.length === 0 || !prev.document) {
        return prev;
      }

      const [entry, ...rest] = prev.redoStack;
      const undoEntry: UndoEntry = {
        content: prev.document.content,
        timestamp: Date.now(),
      };
      const stats = computeTextStats(entry.content);
      const isDirty = entry.content !== prev.document.savedContent;

      return {
        ...prev,
        document: { ...prev.document, content: entry.content },
        redoStack: rest,
        undoStack: [undoEntry, ...prev.undoStack],
        isDirty,
        ...stats,
      };
    });
  }, []);

  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;

  // ── Toggles ──────────────────────────────────────────

  const togglePreview = useCallback(() => {
    setState((prev) => ({ ...prev, showPreview: !prev.showPreview }));
  }, []);

  const toggleAutoSave = useCallback(() => {
    setState((prev) => ({
      ...prev,
      autoSaveEnabled: !prev.autoSaveEnabled,
    }));
  }, []);

  // ── Markdown Insert Helpers ──────────────────────────

  const insertMarkdown = useCallback(
    (before: string, after: string = "") => {
      const textarea = textareaRef.current;

      if (!textarea || !state.document) {
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = state.document.content;
      const selected = content.slice(start, end);
      const replacement = `${before}${selected}${after}`;
      const newContent =
        content.slice(0, start) + replacement + content.slice(end);

      updateContent(newContent);

      // Restore cursor after React re-render
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = selected
          ? start + replacement.length
          : start + before.length;

        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [state.document, updateContent],
  );

  const insertBold = useCallback(() => insertMarkdown("**", "**"), [insertMarkdown]);
  const insertItalic = useCallback(() => insertMarkdown("*", "*"), [insertMarkdown]);
  const insertHeading = useCallback(() => insertMarkdown("## "), [insertMarkdown]);
  const insertCode = useCallback(() => insertMarkdown("`", "`"), [insertMarkdown]);
  const insertCodeBlock = useCallback(() => insertMarkdown("```\n", "\n```"), [insertMarkdown]);
  const insertLink = useCallback(() => insertMarkdown("[", "](url)"), [insertMarkdown]);
  const insertList = useCallback(() => insertMarkdown("- "), [insertMarkdown]);
  const insertOrderedList = useCallback(() => insertMarkdown("1. "), [insertMarkdown]);
  const insertQuote = useCallback(() => insertMarkdown("> "), [insertMarkdown]);

  // ── Keyboard Shortcuts ───────────────────────────────

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const isCmd = event.metaKey || event.ctrlKey;

      if (isCmd && event.key === "s") {
        event.preventDefault();
        save();

        return;
      }

      if (isCmd && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();

        return;
      }

      if (isCmd && event.key === "z" && event.shiftKey) {
        event.preventDefault();
        redo();

        return;
      }

      if (isCmd && event.key === "y") {
        event.preventDefault();
        redo();

        return;
      }

      if (isCmd && event.key === "p" && state.document?.mode === "markdown") {
        event.preventDefault();
        togglePreview();

        return;
      }

      // Markdown shortcuts
      if (isCmd && state.document?.mode === "markdown") {
        if (event.key === "b") {
          event.preventDefault();
          insertBold();

          return;
        }

        if (event.key === "i") {
          event.preventDefault();
          insertItalic();

          return;
        }
      }
    },
    [save, undo, redo, togglePreview, insertBold, insertItalic, state.document?.mode],
  );

  // ── JSON Format ──────────────────────────────────────

  const formatJSON = useCallback(() => {
    if (!state.document || state.document.mode !== "json") {
      return;
    }

    try {
      const parsed = JSON.parse(state.document.content);
      const formatted = JSON.stringify(parsed, null, 2);

      updateContent(formatted);
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Invalid JSON — cannot format.",
      }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, error: null }));
      }, 3000);
    }
  }, [state.document, updateContent]);

  const validateJSON = useMemo(() => {
    if (!state.document || state.document.mode !== "json") {
      return null;
    }

    try {
      JSON.parse(state.document.content);

      return { valid: true, error: null };
    } catch (e) {
      return {
        valid: false,
        error: e instanceof SyntaxError ? e.message : "Invalid JSON",
      };
    }
  }, [state.document]);

  // ── Clear Error ──────────────────────────────────────

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    document: state.document,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    isDirty: state.isDirty,
    showPreview: state.showPreview,
    wordCount: state.wordCount,
    lineCount: state.lineCount,
    charCount: state.charCount,
    autoSaveEnabled: state.autoSaveEnabled,
    lastSavedAt: state.lastSavedAt,
    error: state.error,
    fsHydrated,

    // Capabilities
    canUndo,
    canRedo,
    validateJSON,

    // Refs
    textareaRef,

    // Actions
    openFile,
    updateContent,
    save,
    undo,
    redo,
    togglePreview,
    toggleAutoSave,
    formatJSON,
    clearError,
    handleKeyDown,

    // Markdown inserts
    insertBold,
    insertItalic,
    insertHeading,
    insertCode,
    insertCodeBlock,
    insertLink,
    insertList,
    insertOrderedList,
    insertQuote,
  };
}
