"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  formatShortcutBinding,
  useOSStore,
} from "@/processes";
import type { DockAppState } from "./desktop-shell.types";

export const APP_SWITCHER_FALLBACK_LABEL = "App Switcher";
export const APP_SWITCHER_FALLBACK_SYMBOL = "App Switcher";

type UseAppSwitcherInput = {
  bootReady: boolean;
  dockApps: DockAppState[];
  onActivateApp: (appId: string) => void;
};

type UseAppSwitcherResult = {
  isOpen: boolean;
  selectedAppId: string | null;
  switcherApps: DockAppState[];
  openAppSwitcher: () => void;
  cycleAppSwitcher: (direction: 1 | -1) => void;
  closeAppSwitcher: () => void;
  previewApp: (appId: string) => void;
  activateSelectedApp: () => void;
};

function isEditableTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;

  if (!element) {
    return false;
  }

  const tagName = element.tagName.toLowerCase();

  return tagName === "input" || tagName === "textarea" || element.isContentEditable;
}

function getWrappedIndex(index: number, length: number): number {
  if (length === 0) {
    return 0;
  }

  return (index + length) % length;
}

export function useAppSwitcher({
  bootReady,
  dockApps,
  onActivateApp,
}: UseAppSwitcherInput): UseAppSwitcherResult {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isKeyboardSession, setIsKeyboardSession] = useState(false);

  const switcherApps = useMemo(
    () => dockApps.filter((item) => item.isRunning),
    [dockApps],
  );

  const frontmostIndex = useMemo(() => {
    const index = switcherApps.findIndex((item) => item.isFrontmost);

    return index >= 0 ? index : 0;
  }, [switcherApps]);

  const boundedSelectedIndex = useMemo(() => {
    if (switcherApps.length === 0) {
      return 0;
    }

    return Math.min(selectedIndex, switcherApps.length - 1);
  }, [selectedIndex, switcherApps.length]);

  const selectedAppId = switcherApps[boundedSelectedIndex]?.app.id ?? null;

  const closeAppSwitcher = useCallback(() => {
    setIsOpen(false);
    setIsKeyboardSession(false);
  }, []);

  const openAppSwitcher = useCallback(() => {
    if (switcherApps.length === 0) {
      return;
    }

    setIsOpen(true);
    setIsKeyboardSession(false);
    setSelectedIndex(frontmostIndex);
  }, [frontmostIndex, switcherApps.length]);

  const cycleAppSwitcher = useCallback(
    (direction: 1 | -1) => {
      if (switcherApps.length === 0) {
        return;
      }

      setIsOpen(true);
      setIsKeyboardSession(true);
      setSelectedIndex((current) => {
        const baseIndex = isOpen ? boundedSelectedIndex : frontmostIndex;

        return getWrappedIndex(baseIndex + direction, switcherApps.length);
      });
    },
    [boundedSelectedIndex, frontmostIndex, isOpen, switcherApps.length],
  );

  const previewApp = useCallback(
    (appId: string) => {
      const nextIndex = switcherApps.findIndex((item) => item.app.id === appId);

      if (nextIndex >= 0) {
        setSelectedIndex(nextIndex);
      }
    },
    [switcherApps],
  );

  const activateSelectedApp = useCallback(() => {
    const selectedApp = switcherApps[boundedSelectedIndex];

    if (selectedApp) {
      onActivateApp(selectedApp.app.id);
    }

    closeAppSwitcher();
  }, [boundedSelectedIndex, closeAppSwitcher, onActivateApp, switcherApps]);

  useEffect(() => {
    if (!bootReady) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (!isOpen) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedIndex((current) =>
          getWrappedIndex(current + 1, switcherApps.length),
        );
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedIndex((current) =>
          getWrappedIndex(current - 1, switcherApps.length),
        );
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        activateSelectedApp();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeAppSwitcher();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isKeyboardSession) {
        return;
      }

      if (
        (event.key === "Alt" || event.key === "Meta" || event.key === "Control" || event.key === "Shift") &&
        !event.altKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        activateSelectedApp();
      }
    };

    const handleWindowBlur = () => {
      if (isKeyboardSession) {
        closeAppSwitcher();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [
    activateSelectedApp,
    bootReady,
    closeAppSwitcher,
    isKeyboardSession,
    isOpen,
    switcherApps.length,
  ]);

  return {
    isOpen,
    selectedAppId,
    switcherApps,
    openAppSwitcher,
    cycleAppSwitcher,
    closeAppSwitcher,
    previewApp,
    activateSelectedApp,
  };
}
