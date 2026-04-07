"use client";

import { useCallback } from "react";

import type { WindowInstance } from "@/entities/window";
import {
  useOSStore,
  type AiServiceContext,
} from "@/processes";

type UseAiCommandPaletteShortcutOptions = {
  activeWindow: WindowInstance | null;
  isBooting: boolean;
  onBeforeSurfaceOpen: () => void;
};

type UseAiCommandPaletteShortcutResult = {
  openAiPaletteFromActiveContext: () => Promise<void>;
};

export function useAiCommandPaletteShortcut({
  activeWindow,
  isBooting,
  onBeforeSurfaceOpen,
}: UseAiCommandPaletteShortcutOptions): UseAiCommandPaletteShortcutResult {
  const aiPaletteOpen = useOSStore((state) => state.aiPaletteOpen);

  const buildPaletteContext = useCallback(async (): Promise<AiServiceContext> => {
    const state = useOSStore.getState();
    const sourceAppId = activeWindow?.appId ?? "desktop-shell";
    const sourceWindowId = activeWindow?.id ?? "desktop-shell";
    const publishedContext = activeWindow ? state.aiWindowContexts[activeWindow.id] ?? null : null;

    return {
      sourceAppId,
      sourceWindowId,
      file: publishedContext?.file,
      selection: publishedContext?.selection,
      appState: {
        ...publishedContext?.appState,
        activeAppName: activeWindow
          ? state.appMap[activeWindow.appId]?.name ?? activeWindow.appId
          : "Desktop",
        activeWindowTitle: activeWindow?.title ?? "Desktop",
        hasFileContext: Boolean(publishedContext?.file),
      },
    };
  }, [activeWindow]);

  const openAiPaletteFromActiveContext = useCallback(async () => {
    if (isBooting || aiPaletteOpen) {
      return;
    }

    onBeforeSurfaceOpen();

    const context = await buildPaletteContext();

    useOSStore.getState().aiOpenPalette(context);
  }, [aiPaletteOpen, buildPaletteContext, isBooting, onBeforeSurfaceOpen]);

  return {
    openAiPaletteFromActiveContext,
  };
}
