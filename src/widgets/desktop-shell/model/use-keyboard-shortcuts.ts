"use client";

import { useEffect } from "react";

import { useOSStore, matchShortcut } from "@/processes";

/**
 * Attaches a single global `keydown` listener that dispatches
 * registered OS-level keyboard shortcuts.
 *
 * Must be called once at the desktop-shell level.
 * Active only when `bootPhase === "ready"`.
 */
export function useKeyboardShortcuts(): void {
  const bootPhase = useOSStore((s) => s.bootPhase);

  useEffect(() => {
    if (bootPhase !== "ready") return undefined;

    const handler = (event: KeyboardEvent) => {
      // Skip shortcuts when user is typing in an input/textarea/contenteditable
      const target = event.target as HTMLElement | null;

      if (target) {
        const tag = target.tagName.toLowerCase();

        if (
          tag === "input" ||
          tag === "textarea" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const state = useOSStore.getState();
      const hasActiveWindow = state.activeWindowId !== null;
      const matched = matchShortcut(state.shortcuts, event, hasActiveWindow);

      if (!matched) return;

      if (matched.preventDefault !== false) {
        event.preventDefault();
        event.stopPropagation();
      }

      matched.action();
    };

    window.addEventListener("keydown", handler, { capture: true });

    return () => {
      window.removeEventListener("keydown", handler, { capture: true });
    };
  }, [bootPhase]);
}
