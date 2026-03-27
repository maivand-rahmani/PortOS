"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { useOSStore } from "@/processes";
import type { DesktopBounds, WindowPosition } from "@/entities/window";
import { openAgentWithPrompt } from "@/apps/ai-agent/model/contextLoader";

import { BOOT_SEQUENCE, DESKTOP_AI_WIDGET, DESKTOP_INSETS, DOCK_MENU } from "./desktop-shell.constants";
import {
  clampDesktopIconPosition,
  getDockAppStates,
  getDockMenuEntries,
  syncDesktopIconPositions,
} from "./desktop-shell.layout";
import type {
  DesktopIconDragState,
  DesktopIconMap,
  DesktopWidgetDragState,
  DockMenuAction,
  DockMenuModel,
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
  const [customAiWidgetPosition, setAiWidgetPosition] = useState<WindowPosition | null>(null);
  const [desktopWidgetDragState, setDesktopWidgetDragState] = useState<DesktopWidgetDragState>(null);
  const [dockMenu, setDockMenu] = useState<DockMenuModel | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const apps = useOSStore((state) => state.apps);
  const appMap = useOSStore((state) => state.appMap);
  const windows = useOSStore((state) => state.windows);
  const processes = useOSStore((state) => state.processes);
  const loadedApps = useOSStore((state) => state.loadedApps);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const dragWindowId = useOSStore((state) => state.dragState?.windowId ?? null);
  const resizeWindowId = useOSStore((state) => state.resizeState?.windowId ?? null);
  const bootPhase = useOSStore((state) => state.bootPhase);
  const bootProgress = useOSStore((state) => state.bootProgress);

  const setBootProgress = useOSStore((state) => state.setBootProgress);
  const completeBoot = useOSStore((state) => state.completeBoot);
  const activateApp = useOSStore((state) => state.activateApp);
  const focusWindow = useOSStore((state) => state.focusWindow);
  const closeWindow = useOSStore((state) => state.closeWindow);
  const minimizeWindow = useOSStore((state) => state.minimizeWindow);
  const restoreWindow = useOSStore((state) => state.restoreWindow);
  const launchApp = useOSStore((state) => state.launchApp);
  const terminateProcess = useOSStore((state) => state.terminateProcess);
  const toggleWindowMaximize = useOSStore((state) => state.toggleWindowMaximize);
  const beginWindowDrag = useOSStore((state) => state.beginWindowDrag);
  const updateWindowDrag = useOSStore((state) => state.updateWindowDrag);
  const endWindowDrag = useOSStore((state) => state.endWindowDrag);
  const beginWindowResize = useOSStore((state) => state.beginWindowResize);
  const updateWindowResize = useOSStore((state) => state.updateWindowResize);
  const endWindowResize = useOSStore((state) => state.endWindowResize);
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
          isResizing: resizeWindowId === window.id,
        }))
        .filter((entry) => Boolean(entry.app)),
    [activeWindowId, appMap, dragWindowId, loadedApps, resizeWindowId, windows],
  );

  const dockApps = useMemo(
    () => getDockAppStates(apps, windows, activeWindowId),
    [activeWindowId, apps, windows],
  );

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

  const aiWidgetPosition = useMemo(() => {
    if (customAiWidgetPosition) {
      return customAiWidgetPosition;
    }

    if (!desktopBounds) {
      return null;
    }

    return {
      x: Math.max(desktopBounds.insetLeft, DESKTOP_AI_WIDGET.initialOffset.x),
      y: Math.max(desktopBounds.insetTop + 24, DESKTOP_AI_WIDGET.initialOffset.y),
    };
  }, [customAiWidgetPosition, desktopBounds]);

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

      if (desktopWidgetDragState) {
        const maxX = Math.max(
          desktopBounds.insetLeft,
          desktopBounds.width - desktopBounds.insetRight - DESKTOP_AI_WIDGET.width,
        );
        const maxY = Math.max(
          desktopBounds.insetTop,
          desktopBounds.height - desktopBounds.insetBottom - DESKTOP_AI_WIDGET.height,
        );

        setAiWidgetPosition({
          x: Math.min(
            Math.max(nextPointer.x - desktopWidgetDragState.offset.x, desktopBounds.insetLeft),
            maxX,
          ),
          y: Math.min(
            Math.max(nextPointer.y - desktopWidgetDragState.offset.y, desktopBounds.insetTop),
            maxY,
          ),
        });
      }

      updateWindowDrag(nextPointer, desktopBounds);
      updateWindowResize(nextPointer, desktopBounds);
    };

    const handlePointerUp = () => {
      endWindowDrag();
      endWindowResize();
      setDesktopIconDragState(null);
      setDesktopWidgetDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    desktopBounds,
    desktopIconDragState,
    desktopWidgetDragState,
    endWindowDrag,
    endWindowResize,
    updateWindowDrag,
    updateWindowResize,
  ]);

  const clearDesktopSelection = () => {
    setSelectedDesktopAppId(null);
  };

  const closeDockMenu = () => {
    setDockMenu(null);
  };

  const selectDesktopApp = (appId: string | null) => {
    setSelectedDesktopAppId(appId);
  };

  const openDesktopApp = (appId: string) => {
    if (!desktopBounds) {
      return;
    }

    setDockMenu(null);
    setSelectedDesktopAppId(appId);
    void activateApp(appId, desktopBounds);
  };

  const openAgentPrompt = (prompt: string) => {
    if (!desktopBounds) {
      return;
    }

    openAgentWithPrompt(prompt);
    setDockMenu(null);
    setSelectedDesktopAppId("ai-agent");
    void activateApp("ai-agent", desktopBounds);
  };

  const launchDesktopApp = (appId: string) => {
    if (!desktopBounds) {
      return;
    }

    setDockMenu(null);
    setSelectedDesktopAppId(appId);
    void launchApp(appId, desktopBounds);
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

  const beginAiWidgetDrag = (pointer: WindowPosition) => {
    if (bootPhase !== "ready" || !aiWidgetPosition) {
      return;
    }

    const localPointer = getContainerPointer(pointer);

    setDesktopWidgetDragState({
      offset: {
        x: localPointer.x - aiWidgetPosition.x,
        y: localPointer.y - aiWidgetPosition.y,
      },
    });
  };

  const beginDesktopWindowDrag = (windowId: string, pointer: WindowPosition) => {
    setDockMenu(null);
    beginWindowDrag(windowId, getContainerPointer(pointer));
  };

  const beginDesktopWindowResize = (
    windowId: string,
    direction: Parameters<UseDesktopShellResult["beginWindowResize"]>[1],
    pointer: WindowPosition,
  ) => {
    setDockMenu(null);
    beginWindowResize(windowId, direction, getContainerPointer(pointer));
  };

  const toggleDesktopWindowMaximize = (windowId: string) => {
    if (!desktopBounds) {
      return;
    }

    toggleWindowMaximize(windowId, desktopBounds);
  };

  const openDockMenu = (appId: string, anchor: WindowPosition) => {
    const item = dockApps.find((entry) => entry.app.id === appId);

    if (!item || !desktopBounds) {
      return;
    }

    const localAnchor = getContainerPointer({
      x: anchor.x,
      y: window.innerHeight - anchor.y,
    });
    const clampedX = Math.min(
      Math.max(localAnchor.x - DOCK_MENU.width / 2, DOCK_MENU.safeMargin),
      desktopBounds.width - DOCK_MENU.width - DOCK_MENU.safeMargin,
    );

    setDockMenu({
      item,
      entries: getDockMenuEntries(item),
      position: {
        x: clampedX,
        y: Math.max(
          DOCK_MENU.safeMargin,
          desktopBounds.height - localAnchor.y + DOCK_MENU.verticalOffset,
        ),
      },
    });
  };

  const runDockMenuAction = (action: DockMenuAction) => {
    setDockMenu(null);

    switch (action.id) {
      case "open-app": {
        openDesktopApp(action.appId);
        return;
      }
      case "new-window": {
        launchDesktopApp(action.appId);
        return;
      }
      case "restore-all-windows": {
        dockApps
          .find((item) => item.app.id === action.appId)
          ?.minimizedWindows.forEach((window) => {
            restoreWindow(window.id);
          });
        return;
      }
      case "focus-window": {
        focusWindow(action.windowId);
        return;
      }
      case "restore-window": {
        restoreWindow(action.windowId);
        return;
      }
      case "minimize-window": {
        minimizeWindow(action.windowId);
        return;
      }
      case "quit-app": {
        dockApps
          .find((item) => item.app.id === action.appId)
          ?.windows.forEach((window) => {
            const runtimeWindow = windows.find((entry) => entry.id === window.id);

            if (runtimeWindow) {
              terminateProcess(runtimeWindow.processId);
            }
          });
      }
    }
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
    aiWidgetPosition,
    dockApps,
    dockMenu,
    minimizedWindows,
    visibleWindows,
    clearDesktopSelection,
    closeDockMenu,
    selectDesktopApp,
    openDesktopApp,
    openAgentPrompt,
    beginAiWidgetDrag,
    beginDesktopIconDrag,
    openDockMenu,
    runDockMenuAction,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleWindowMaximize: toggleDesktopWindowMaximize,
    beginWindowDrag: beginDesktopWindowDrag,
    beginWindowResize: beginDesktopWindowResize,
  };
}
