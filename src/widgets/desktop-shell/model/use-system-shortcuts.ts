"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  DEFAULT_SYSTEM_SHORTCUT_BINDINGS,
  bindingMatchesEvent,
  getSequenceEventKey,
  matchSequenceBinding,
  SEQUENCE_SHORTCUT_TIMEOUT_MS,
  useOSStore,
  type ShortcutBinding,
  type ShortcutPresetId,
  type ShortcutSequenceKey,
} from "@/processes";

type UseSystemShortcutsOptions = {
  isBooting: boolean;
  isSpotlightOpen: boolean;
  isNotificationCenterOpen: boolean;
  isAppSwitcherOpen: boolean;
  isMissionControlOpen: boolean;
  isInteractiveKeyboardTarget: (target: HTMLElement | null) => boolean;
  onBeforeSurfaceOpen: () => void;
  onToggleSpotlight: () => void;
  onOpenMissionControl: () => void;
  onCycleAppSwitcher: (direction: 1 | -1) => void;
  onOpenAiPaletteFromActiveContext: () => Promise<void>;
};

type RunSystemShortcutOptions = {
  direction?: 1 | -1;
  ignoreSurfaceState?: boolean;
};

type UseSystemShortcutsResult = {
  runSystemShortcut: (shortcutId: string, options?: RunSystemShortcutOptions) => boolean;
};

function isEditableKeyboardTarget(target: HTMLElement | null): boolean {
  if (!target) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

function matchesSequencePrefix(binding: ShortcutBinding, steps: ShortcutSequenceKey[]): boolean {
  return (
    binding.kind === "sequence" &&
    steps.length > 0 &&
    steps.length <= binding.steps.length &&
    steps.every((step, index) => binding.steps[index] === step)
  );
}

export function useSystemShortcuts({
  isBooting,
  isSpotlightOpen,
  isNotificationCenterOpen,
  isAppSwitcherOpen,
  isMissionControlOpen,
  isInteractiveKeyboardTarget,
  onBeforeSurfaceOpen,
  onToggleSpotlight,
  onOpenMissionControl,
  onCycleAppSwitcher,
  onOpenAiPaletteFromActiveContext,
}: UseSystemShortcutsOptions): UseSystemShortcutsResult {
  const aiPaletteOpen = useOSStore((state) => state.aiPaletteOpen);
  const shortcutBindings = useOSStore((state) => state.osSettings.shortcutBindings);
  const sequenceTimerRef = useRef<number | null>(null);
  const sequenceRef = useRef<ShortcutSequenceKey[]>([]);

  const bindings = useMemo(
    () => ({
      ...DEFAULT_SYSTEM_SHORTCUT_BINDINGS,
      ...shortcutBindings,
    }),
    [shortcutBindings],
  );

  const clearSequenceTimer = useCallback(() => {
    if (sequenceTimerRef.current === null) {
      return;
    }

    window.clearTimeout(sequenceTimerRef.current);
    sequenceTimerRef.current = null;
  }, []);

  const resetSequence = useCallback(() => {
    clearSequenceTimer();
    sequenceRef.current = [];
  }, [clearSequenceTimer]);

  const runSystemShortcut = useCallback(
    (shortcutId: string, options?: RunSystemShortcutOptions): boolean => {
      const state = useOSStore.getState();
      const direction = options?.direction ?? 1;
      const ignoreSurfaceState = options?.ignoreSurfaceState ?? false;

      switch (shortcutId as ShortcutPresetId) {
        case "os:spotlight": {
          onToggleSpotlight();
          return true;
        }
        case "os:mission-control": {
          if (
            !ignoreSurfaceState &&
            (isSpotlightOpen ||
              isNotificationCenterOpen ||
              isAppSwitcherOpen ||
              isMissionControlOpen ||
              aiPaletteOpen)
          ) {
            return false;
          }

          onBeforeSurfaceOpen();
          onOpenMissionControl();
          return true;
        }
        case "os:ai-palette": {
          if (
            isBooting ||
            (!ignoreSurfaceState &&
              (isSpotlightOpen ||
                isNotificationCenterOpen ||
                isAppSwitcherOpen ||
                isMissionControlOpen ||
                aiPaletteOpen))
          ) {
            return false;
          }

          void onOpenAiPaletteFromActiveContext();
          return true;
        }
        case "os:app-switcher": {
          onCycleAppSwitcher(direction);
          return true;
        }
        case "os:close-window": {
          if (!state.activeWindowId) {
            return false;
          }

          state.closeWindow(state.activeWindowId);
          return true;
        }
        case "os:minimize-window": {
          if (!state.activeWindowId) {
            return false;
          }

          state.minimizeWindow(state.activeWindowId);
          return true;
        }
        case "os:quit-app": {
          const activeWindow = state.activeWindowId ? state.windowRecord[state.activeWindowId] : undefined;

          if (!activeWindow) {
            return false;
          }

          const appWindows = state.windows.filter((window) => window.appId === activeWindow.appId);

          for (const window of appWindows) {
            state.closeWindow(window.id);
          }

          return true;
        }
        case "os:hide-app": {
          const activeWindow = state.activeWindowId ? state.windowRecord[state.activeWindowId] : undefined;

          if (!activeWindow) {
            return false;
          }

          const appWindows = state.windows.filter(
            (window) => window.appId === activeWindow.appId && !window.isMinimized,
          );

          for (const window of appWindows) {
            state.minimizeWindow(window.id);
          }

          return true;
        }
        case "os:cycle-window": {
          const visibleWindows = [...state.windows]
            .filter((window) => !window.isMinimized)
            .sort((left, right) => left.zIndex - right.zIndex);

          if (visibleWindows.length < 2) {
            return false;
          }

          const currentIndex = visibleWindows.findIndex((window) => window.id === state.activeWindowId);
          const nextIndex = (currentIndex + 1) % visibleWindows.length;

          state.focusWindow(visibleWindows[nextIndex].id);
          return true;
        }
        case "os:workspace-1": {
          state.switchWorkspace("space-1");
          return true;
        }
        case "os:workspace-2": {
          state.switchWorkspace("space-2");
          return true;
        }
        case "os:workspace-3": {
          state.switchWorkspace("space-3");
          return true;
        }
        case "os:space-left": {
          state.cycleWorkspace(-1);
          return true;
        }
        case "os:space-right": {
          state.cycleWorkspace(1);
          return true;
        }
        default:
          return false;
      }
    },
    [
      aiPaletteOpen,
      isAppSwitcherOpen,
      isBooting,
      isMissionControlOpen,
      isNotificationCenterOpen,
      isSpotlightOpen,
      onBeforeSurfaceOpen,
      onCycleAppSwitcher,
      onOpenAiPaletteFromActiveContext,
      onOpenMissionControl,
      onToggleSpotlight,
    ],
  );

  useEffect(() => {
    if (isBooting) {
      resetSequence();
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (!isEditableKeyboardTarget(target)) {
        for (const [shortcutId, binding] of Object.entries(bindings) as Array<[
          ShortcutPresetId,
          ShortcutBinding,
        ]>) {
          if (binding.kind !== "combo") {
            continue;
          }

          if (!bindingMatchesEvent(binding, event)) {
            continue;
          }

          const direction =
            shortcutId === "os:app-switcher" && !binding.modifiers.includes("shift") && event.shiftKey
              ? -1
              : 1;

          if (!runSystemShortcut(shortcutId, { direction })) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          resetSequence();
          return;
        }
      }

      const sequenceKey = getSequenceEventKey(event);

      if (!sequenceKey) {
        return;
      }

      if (isInteractiveKeyboardTarget(target)) {
        resetSequence();
        return;
      }

      const nextSteps = [...sequenceRef.current, sequenceKey].slice(-2);
      const sequenceBindings = (Object.entries(bindings) as Array<[ShortcutPresetId, ShortcutBinding]>).filter(
        ([, binding]) => binding.kind === "sequence",
      );
      const hasPrefix = sequenceBindings.some(([, binding]) => matchesSequencePrefix(binding, nextSteps));

      if (!hasPrefix) {
        resetSequence();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      sequenceRef.current = nextSteps;
      clearSequenceTimer();

      const matchedBinding = sequenceBindings.find(([, binding]) => matchSequenceBinding(binding, nextSteps));

      if (matchedBinding) {
        runSystemShortcut(matchedBinding[0]);
        resetSequence();
        return;
      }

      sequenceTimerRef.current = window.setTimeout(() => {
        resetSequence();
      }, SEQUENCE_SHORTCUT_TIMEOUT_MS);
    };

    const handleBlur = () => {
      resetSequence();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("blur", handleBlur);

    return () => {
      resetSequence();
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("blur", handleBlur);
    };
  }, [bindings, clearSequenceTimer, isBooting, isInteractiveKeyboardTarget, resetSequence, runSystemShortcut]);

  return {
    runSystemShortcut,
  };
}
