"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { useOSStore } from "@/processes";
import type { DesktopBounds, WindowPosition } from "@/entities/window";

import { BOOT_SEQUENCE, DESKTOP_INSETS } from "./desktop-shell.constants";
import {
  clampDesktopIconPosition,
  getDockAppStates,
  syncDesktopIconPositions,
} from "./desktop-shell.layout";
import type {
  DesktopIconDragState,
  DesktopIconMap,
  WindowRenderItem,
  UseDesktopShellResult,
} from "./desktop-shell.types";

export function useDesktopShell(): UseDesktopShellResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [desktopBounds, setDesktopBounds] = useState<DesktopBounds | null>(null);
  const [selectedDesktopAppId, setSelectedDesktopAppId] = useState<string | null>(null);
  const [customDesktopIconPositions, setDesktopIconPositions] = useState<DesktopIconMap>({});
  const [desktopIconDragState, setDesktopIconDragState] =
    useState<DesktopIconDragState>(null);
  const shouldReduceMotion = useReducedMotion();

  const apps = useOSStore((state) => state.apps);
  const appMap = useOSStore((state) => state.appMap);
  const windows = useOSStore((state) => state.windows);
  const processes = useOSStore((state) => state.processes);
  const loadedApps = useOSStore((state) => state.loadedApps);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const dragWindowId = useOSStore((state) => state.dragState?.windowId ?? null);
  const bootPhase = useOSStore((state) => state.bootPhase);
  const bootProgress = useOSStore((state) => state.bootProgress);

  const setBootProgress = useOSStore((state) => state.setBootProgress);
  const completeBoot = useOSStore((state) => state.completeBoot);
  const activateApp = useOSStore((state) => state.activateApp);
  const focusWindow = useOSStore((state) => state.focusWindow);
  const closeWindow = useOSStore((state) => state.closeWindow);
  const minimizeWindow = useOSStore((state) => state.minimizeWindow);
  const restoreWindow = useOSStore((state) => state.restoreWindow);
  const toggleWindowMaximize = useOSStore((state) => state.toggleWindowMaximize);
  const beginWindowDrag = useOSStore((state) => state.beginWindowDrag);
  const updateWindowDrag = useOSStore((state) => state.updateWindowDrag);
  const endWindowDrag = useOSStore((state) => state.endWindowDrag);
  const resizeWindowsToBounds = useOSStore((state) => state.resizeWindowsToBounds);

  const visibleWindows = useMemo<WindowRenderItem[]>(
    () =>
      [...windows]
        .filter((window) => !window.isMinimized)
        .sort((left, right) => left.zIndex - right.zIndex)
        .map((window) => ({
          window,
          app: appMap[window.appId],
          AppComponent: loadedApps[window.appId] ?? null,
          isActive: window.id === activeWindowId,
          isDragging: dragWindowId === window.id,
        }))
        .filter((entry) => Boolean(entry.app)),
    [activeWindowId, appMap, dragWindowId, loadedApps, windows],
  );

  const dockApps = useMemo(() => getDockAppStates(apps, windows), [apps, windows]);

  const desktopIconPositions = useMemo(
    () => syncDesktopIconPositions(apps, desktopBounds, customDesktopIconPositions),
    [apps, customDesktopIconPositions, desktopBounds],
  );

  const minimizedWindows = useMemo(
    () => windows.filter((window) => window.isMinimized),
    [windows],
  );

  const getContainerPointer = (pointer: WindowPosition): WindowPosition => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return pointer;
    }

    return {
      x: pointer.x - rect.left,
      y: pointer.y - rect.top,
    };
  };

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const calculateBounds = () => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();

      setDesktopBounds({
        width: rect.width,
        height: rect.height,
        insetTop: DESKTOP_INSETS.top,
        insetRight: DESKTOP_INSETS.right,
        insetBottom: DESKTOP_INSETS.bottom,
        insetLeft: DESKTOP_INSETS.left,
      });
    };

    calculateBounds();

    const observer = new ResizeObserver(() => {
      calculateBounds();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!desktopBounds) {
      return;
    }

    resizeWindowsToBounds(desktopBounds);
  }, [desktopBounds, resizeWindowsToBounds]);

  useEffect(() => {
    if (bootPhase !== "booting") {
      return undefined;
    }

    let stepIndex = 0;

    const advanceBoot = () => {
      const progress = BOOT_SEQUENCE[stepIndex];

      if (progress === undefined) {
        completeBoot();

        return;
      }

      setBootProgress(progress);
      stepIndex += 1;
    };

    advanceBoot();

    const intervalId = window.setInterval(
      advanceBoot,
      shouldReduceMotion ? 90 : 260,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [bootPhase, completeBoot, setBootProgress, shouldReduceMotion]);

  useEffect(() => {
    if (!desktopBounds) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const nextPointer = getContainerPointer({
        x: event.clientX,
        y: event.clientY,
      });

      if (desktopIconDragState) {
        const nextPosition = clampDesktopIconPosition(
          {
            x: nextPointer.x - desktopIconDragState.offset.x,
            y: nextPointer.y - desktopIconDragState.offset.y,
          },
          desktopBounds,
        );

        setDesktopIconPositions((current) => ({
          ...current,
          [desktopIconDragState.appId]: nextPosition,
        }));
      }

      updateWindowDrag(
        nextPointer,
        desktopBounds,
      );
    };

    const handlePointerUp = () => {
      endWindowDrag();
      setDesktopIconDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [desktopBounds, desktopIconDragState, endWindowDrag, updateWindowDrag]);

  const clearDesktopSelection = () => {
    setSelectedDesktopAppId(null);
  };

  const selectDesktopApp = (appId: string | null) => {
    setSelectedDesktopAppId(appId);
  };

  const openDesktopApp = (appId: string) => {
    if (!desktopBounds) {
      return;
    }

    setSelectedDesktopAppId(appId);
    void activateApp(appId, desktopBounds);
  };

  const beginDesktopIconDrag = (appId: string, pointer: WindowPosition) => {
    if (bootPhase !== "ready") {
      return;
    }

    const localPointer = getContainerPointer(pointer);
    const currentPosition = desktopIconPositions[appId];

    if (!currentPosition) {
      return;
    }

    setSelectedDesktopAppId(appId);
    setDesktopIconDragState({
      appId,
      offset: {
        x: localPointer.x - currentPosition.x,
        y: localPointer.y - currentPosition.y,
      },
    });
  };

  const beginDesktopWindowDrag = (windowId: string, pointer: WindowPosition) => {
    beginWindowDrag(windowId, getContainerPointer(pointer));
  };

  const toggleDesktopWindowMaximize = (windowId: string) => {
    if (!desktopBounds) {
      return;
    }

    toggleWindowMaximize(windowId, desktopBounds);
  };

  return {
    containerRef,
    apps,
    processCount: processes.length,
    bootPhase,
    bootProgress,
    desktopBounds,
    selectedDesktopAppId,
    desktopIconPositions,
    dockApps,
    minimizedWindows,
    visibleWindows,
    clearDesktopSelection,
    selectDesktopApp,
    openDesktopApp,
    beginDesktopIconDrag,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleWindowMaximize: toggleDesktopWindowMaximize,
    beginWindowDrag: beginDesktopWindowDrag,
  };
}
