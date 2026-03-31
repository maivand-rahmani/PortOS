"use client";

import { useEffect } from "react";

import { useOSStore } from "@/processes";
import type { Shortcut } from "@/processes";

/**
 * Registers the default OS-level keyboard shortcuts on mount.
 *
 * These shortcuts mirror standard macOS behavior:
 * - ⌘ W  — Close active window
 * - ⌘ M  — Minimize active window
 * - ⌘ Q  — Quit active app (close all its windows)
 * - ⌘ H  — Hide active app (minimize all its windows)
 * - ⌘ `  — Cycle to next window
 */
export function useDefaultShortcuts(): void {
  const registerShortcuts = useOSStore((s) => s.registerShortcuts);
  const bootPhase = useOSStore((s) => s.bootPhase);

  useEffect(() => {
    if (bootPhase !== "ready") return;

    const shortcuts: Shortcut[] = [
      {
        id: "os:close-window",
        label: "Close window",
        key: "w",
        modifiers: ["meta"],
        scope: "app",
        action: () => {
          const { activeWindowId, closeWindow } = useOSStore.getState();

          if (activeWindowId) closeWindow(activeWindowId);
        },
      },
      {
        id: "os:minimize-window",
        label: "Minimize window",
        key: "m",
        modifiers: ["meta"],
        scope: "app",
        action: () => {
          const { activeWindowId, minimizeWindow } = useOSStore.getState();

          if (activeWindowId) minimizeWindow(activeWindowId);
        },
      },
      {
        id: "os:quit-app",
        label: "Quit app",
        key: "q",
        modifiers: ["meta"],
        scope: "app",
        action: () => {
          const { activeWindowId, windows, closeWindow } =
            useOSStore.getState();
          const activeWindow = windows.find((w) => w.id === activeWindowId);

          if (!activeWindow) return;

          const appWindows = windows.filter(
            (w) => w.appId === activeWindow.appId,
          );

          for (const w of appWindows) {
            closeWindow(w.id);
          }
        },
      },
      {
        id: "os:hide-app",
        label: "Hide app",
        key: "h",
        modifiers: ["meta"],
        scope: "app",
        action: () => {
          const { activeWindowId, windows, minimizeWindow } =
            useOSStore.getState();
          const activeWindow = windows.find((w) => w.id === activeWindowId);

          if (!activeWindow) return;

          const appWindows = windows.filter(
            (w) => w.appId === activeWindow.appId && !w.isMinimized,
          );

          for (const w of appWindows) {
            minimizeWindow(w.id);
          }
        },
      },
      {
        id: "os:cycle-window",
        label: "Next window",
        key: "`",
        modifiers: ["meta"],
        scope: "global",
        action: () => {
          const { windows, activeWindowId, focusWindow } =
            useOSStore.getState();
          const visible = windows
            .filter((w) => !w.isMinimized)
            .sort((a, b) => a.zIndex - b.zIndex);

          if (visible.length < 2) return;

          const currentIndex = visible.findIndex(
            (w) => w.id === activeWindowId,
          );
          const nextIndex = (currentIndex + 1) % visible.length;

          focusWindow(visible[nextIndex].id);
        },
      },
    ];

    registerShortcuts(shortcuts);
  }, [bootPhase, registerShortcuts]);
}
