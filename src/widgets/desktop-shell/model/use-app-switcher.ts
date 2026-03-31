"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { DockAppState } from "./desktop-shell.types";

const FALLBACK_MODIFIER_KEY = "Alt";
const FALLBACK_CYCLE_KEY = "Tab";

export const APP_SWITCHER_FALLBACK_LABEL = "Option + Tab";
export const APP_SWITCHER_FALLBACK_SYMBOL = "⌥ Tab";

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

  const selectedAppId = switcherApps[selectedIndex]?.app.id ?? null;

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
    const selectedApp = switcherApps[selectedIndex];

    if (selectedApp) {
      onActivateApp(selectedApp.app.id);
    }

    closeAppSwitcher();
  }, [closeAppSwitcher, onActivateApp, selectedIndex, switcherApps]);

  useEffect(() => {
    if (switcherApps.length === 0) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex((current) => Math.min(current, switcherApps.length - 1));
  }, [switcherApps.length]);

  useEffect(() => {
    if (!bootReady) {
      closeAppSwitcher();
    }
  }, [bootReady, closeAppSwitcher]);

  useEffect(() => {
    if (!bootReady) {
      return undefined;
    }

    const handleCycle = (direction: 1 | -1) => {
      if (switcherApps.length === 0) {
        return;
      }

      setIsOpen(true);
      setIsKeyboardSession(true);
      setSelectedIndex((current) => {
        const baseIndex = isOpen ? current : frontmostIndex;

        return getWrappedIndex(baseIndex + direction, switcherApps.length);
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.altKey && event.key === FALLBACK_CYCLE_KEY) {
        event.preventDefault();
        event.stopPropagation();
        handleCycle(event.shiftKey ? -1 : 1);
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

      if (event.key === FALLBACK_MODIFIER_KEY) {
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
    frontmostIndex,
    isKeyboardSession,
    isOpen,
    switcherApps.length,
  ]);

  return {
    isOpen,
    selectedAppId,
    switcherApps,
    openAppSwitcher,
    closeAppSwitcher,
    previewApp,
    activateSelectedApp,
  };
}
