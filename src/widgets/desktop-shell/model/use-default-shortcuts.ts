"use client";

import { useEffect } from "react";

import { useOSStore } from "@/processes";

type UseDefaultShortcutsOptions = {
  allItemIds: string[];
};

export function useDefaultShortcuts({ allItemIds }: UseDefaultShortcutsOptions): void {
  useEffect(() => {
    const store = useOSStore.getState();

    store.registerShortcuts([
      {
        id: "desktop:select-all",
        label: "Select All",
        key: "a",
        modifiers: ["meta"],
        scope: "global",
        preventDefault: false,
        action: () => {
          const state = useOSStore.getState();
          if (state.activeWindowId !== null) return;
          if (state.aiPaletteOpen) return;
          state.setDesktopSelections(allItemIds);
        },
      },
      {
        id: "desktop:copy",
        label: "Copy",
        key: "c",
        modifiers: ["meta"],
        scope: "global",
        preventDefault: false,
        action: () => {
          const state = useOSStore.getState();
          if (state.activeWindowId !== null) return;
          if (state.aiPaletteOpen) return;
          const fsIds = state.desktopSelections
            .filter((sel) => sel.startsWith("fs:"))
            .map((sel) => sel.slice(3));
          if (fsIds.length === 0) return;
          state.fsCopy(fsIds);
        },
      },
      {
        id: "desktop:paste",
        label: "Paste",
        key: "v",
        modifiers: ["meta"],
        scope: "global",
        preventDefault: false,
        action: () => {
          const state = useOSStore.getState();
          if (state.activeWindowId !== null) return;
          if (state.aiPaletteOpen) return;
          const clipboard = state.fsClipboard;
          if (!clipboard || clipboard.nodeIds.length === 0) return;
          void state.fsPaste("dir-desktop");
        },
      },
    ]);

    return () => {
      useOSStore.getState().unregisterShortcut("desktop:select-all");
      useOSStore.getState().unregisterShortcut("desktop:copy");
      useOSStore.getState().unregisterShortcut("desktop:paste");
    };
  }, [allItemIds]);
}
