"use client";

import { useEffect, useMemo } from "react";

import { useOSStore } from "@/processes";
import type { DesktopBounds } from "@/entities/window";
import { dispatchFilesFocusNodeRequest } from "@/shared/lib/os-events/files-os-events";

import type { DesktopItem } from "./desktop-context-menu/desktop-context-menu.types";
import { getDesktopIconConfig } from "./desktop-shell.constants";

const DESKTOP_DIRECTORY_ID = "dir-desktop";

function getDesktopKeyboardRows(
  bounds: DesktopBounds | null,
  viewMode: "grid" | "compact",
): number {
  if (!bounds) {
    return 5;
  }

  const iconConfig = getDesktopIconConfig(viewMode);

  const usableHeight =
    bounds.height -
    bounds.insetTop -
    bounds.insetBottom -
    iconConfig.frame.height;

  return Math.max(1, Math.floor(usableHeight / iconConfig.spacing.y) + 1);
}

function getItemId(item: DesktopItem): string {
  return item.kind === "app" ? `app:${item.app.id}` : `fs:${item.node.id}`;
}

function isInputFocused(target: HTMLElement | null): boolean {
  if (!target) {
    return false;
  }

  const tag = target.tagName.toLowerCase();

  return tag === "input" || tag === "textarea" || target.isContentEditable;
}

export function useDesktopKeyboardNav(
  desktopItems: DesktopItem[],
  desktopSelections: string[],
  openDesktopItem: (itemId: string) => void,
  desktopBounds: DesktopBounds | null,
  viewMode: "grid" | "compact",
): void {
  const bootPhase = useOSStore((s) => s.bootPhase);

  const allItemIds = useMemo(
    () => desktopItems.map((item) => getItemId(item)),
    [desktopItems],
  );

  const rows = useMemo(
    () => getDesktopKeyboardRows(desktopBounds, viewMode),
    [desktopBounds, viewMode],
  );

  useEffect(() => {
    if (bootPhase !== "ready") {
      return undefined;
    }

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (isInputFocused(target)) {
        return;
      }

      const state = useOSStore.getState();
      const hasActiveWindow = state.activeWindowId !== null;

      if (hasActiveWindow) {
        return;
      }

      if (state.aiPaletteOpen) {
        return;
      }

      if (allItemIds.length === 0) {
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowLeft"
      ) {
        event.preventDefault();

        const currentSelection =
          desktopSelections.length > 0 ? desktopSelections[0] : null;
        const currentIndex = currentSelection
          ? allItemIds.indexOf(currentSelection)
          : -1;

        let nextIndex: number;

        if (currentIndex === -1) {
          nextIndex = 0;
        } else {
          const total = allItemIds.length;

          switch (event.key) {
            case "ArrowDown": {
              const col = Math.floor(currentIndex / rows);
              const row = currentIndex % rows;
              const nextRow = row + 1;
              const candidate = col * rows + nextRow;
              nextIndex = candidate < total ? candidate : currentIndex;
              break;
            }
            case "ArrowUp": {
              const row = currentIndex % rows;
              const nextRow = row - 1;
              nextIndex =
                nextRow >= 0
                  ? currentIndex - 1
                  : currentIndex;
              break;
            }
            case "ArrowRight": {
              const candidate = currentIndex + rows;
              nextIndex = candidate < total ? candidate : currentIndex;
              break;
            }
            case "ArrowLeft": {
              const candidate = currentIndex - rows;
              nextIndex = candidate >= 0 ? candidate : currentIndex;
              break;
            }
            default: {
              return;
            }
          }
        }

        const nextItemId = allItemIds[nextIndex];
        if (nextItemId) {
          useOSStore.getState().setDesktopSelections([nextItemId]);
        }

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        if (desktopSelections.length > 0) {
          openDesktopItem(desktopSelections[0]);
        }

        return;
      }

      if (event.key === " ") {
        const firstSelection = desktopSelections[0];

        if (!firstSelection || !firstSelection.startsWith("fs:")) {
          return;
        }

        event.preventDefault();

        const nodeId = firstSelection.slice(3);
        const node = useOSStore.getState().fsNodeMap[nodeId];

        if (!node) {
          return;
        }

        dispatchFilesFocusNodeRequest({
          nodeId,
          source: "desktop-preview",
        });

        void useOSStore.getState().activateApp("files");

        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();

        for (const sel of desktopSelections) {
          if (!sel.startsWith("fs:")) {
            continue;
          }

          const nodeId = sel.slice(3);

          void useOSStore.getState().fsDeleteNode(nodeId);
        }

        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "a") {
        event.preventDefault();
        useOSStore.getState().setDesktopSelections(allItemIds);
        return;
      }

      if (key === "c") {
        const fsIds = desktopSelections
          .filter((sel) => sel.startsWith("fs:"))
          .map((sel) => sel.slice(3));

        if (fsIds.length === 0) {
          return;
        }

        event.preventDefault();
        useOSStore.getState().fsCopy(fsIds);
        return;
      }

      if (key === "v") {
        const clipboard = useOSStore.getState().fsClipboard;

        if (!clipboard || clipboard.nodeIds.length === 0) {
          return;
        }

        event.preventDefault();
        void useOSStore.getState().fsPaste(DESKTOP_DIRECTORY_ID);
      }
    };

    window.addEventListener("keydown", handler, { capture: true });

    return () => {
      window.removeEventListener("keydown", handler, { capture: true });
    };
  }, [
    allItemIds,
    bootPhase,
    desktopBounds,
    desktopItems,
    desktopSelections,
    openDesktopItem,
    rows,
    viewMode,
  ]);
}
