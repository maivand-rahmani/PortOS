"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { getActiveRuntimeTarget, useOSStore } from "@/processes";
import type { DesktopBounds, WindowPosition } from "@/entities/window";
import { openAgentWithPrompt } from "@/apps/ai-agent/model/external";

import { runDataMigration } from "@/shared/lib/fs-migration";
import {
  BOOT_PHASE_DURATIONS,
  BOOT_PROGRESS_KEYFRAMES,
  BOOT_SESSION_KEY,
  DESKTOP_AI_WIDGET,
  DESKTOP_INSETS,
  DOCK_MENU,
} from "./desktop-shell.constants";
import {
  createStatusBarCommandRunner,
  getStatusBarModel,
  type StatusBarCommandContext,
  type StatusBarModel,
} from "./status-bar";
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
  const bootMessages = useOSStore((state) => state.bootMessages);

  const setBootPhase = useOSStore((state) => state.setBootPhase);
  const setBootProgress = useOSStore((state) => state.setBootProgress);
  const addBootMessage = useOSStore((state) => state.addBootMessage);
  const completeBoot = useOSStore((state) => state.completeBoot);
  const hydrateFileSystem = useOSStore((state) => state.hydrateFileSystem);
  const hydrateSettings = useOSStore((state) => state.hydrateSettings);
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
  const snapWindowToZone = useOSStore((state) => state.snapWindowToZone);
  const windowSnapZone = useOSStore((state) => state.windowSnapZone);
  const dragState = useOSStore((state) => state.dragState);
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

  const activeRuntimeTarget = useMemo(
    () =>
      getActiveRuntimeTarget({
        activeWindowId,
        appMap,
        processes,
        windows,
      }),
    [activeWindowId, appMap, processes, windows],
  );

  const statusBar = useMemo<StatusBarModel>(
    () =>
      getStatusBarModel({
        activeApp: activeRuntimeTarget.activeApp,
        activeProcess: activeRuntimeTarget.activeProcess,
        activeWindow: activeRuntimeTarget.activeWindow,
        processCount: processes.length,
      }),
    [activeRuntimeTarget, processes.length],
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

  // ── Boot sequence state machine ──────────────────────────────────────────────
  useEffect(() => {
    if (bootPhase !== "off") {
      return undefined;
    }

    // Check sessionStorage for same-session revisit (auto-skip)
    if (typeof window !== "undefined" && sessionStorage.getItem(BOOT_SESSION_KEY)) {
      // Fast boot: skip cinematic sequence, still hydrate data
      hydrateFileSystem().then(() => runDataMigration());
      void hydrateSettings();
      setBootProgress(100);
      addBootMessage("System ready");
      completeBoot();
      return undefined;
    }

    // Start the cinematic boot: power-on phase
    setBootPhase("power-on");
    return undefined;
  }, [bootPhase, setBootPhase, setBootProgress, addBootMessage, completeBoot, hydrateFileSystem, hydrateSettings]);

  useEffect(() => {
    if (bootPhase !== "power-on") {
      return undefined;
    }

    const duration = shouldReduceMotion ? 100 : BOOT_PHASE_DURATIONS["power-on"];
    const timer = window.setTimeout(() => {
      setBootPhase("logo");
    }, duration);

    return () => window.clearTimeout(timer);
  }, [bootPhase, setBootPhase, shouldReduceMotion]);

  useEffect(() => {
    if (bootPhase !== "logo") {
      return undefined;
    }

    // Start hydration in parallel with logo animation
    const hydrationPromise = hydrateFileSystem().then(() => runDataMigration());
    const settingsPromise = hydrateSettings();

    const duration = shouldReduceMotion ? 200 : BOOT_PHASE_DURATIONS.logo;
    const timer = window.setTimeout(async () => {
      // Wait for hydration to complete before moving to init
      await Promise.all([hydrationPromise, settingsPromise]);
      setBootPhase("init");
    }, duration);

    return () => window.clearTimeout(timer);
  }, [bootPhase, setBootPhase, hydrateFileSystem, hydrateSettings, shouldReduceMotion]);

  useEffect(() => {
    if (bootPhase !== "init") {
      return undefined;
    }

    let cancelled = false;

    const runProgressSequence = async () => {
      for (const keyframe of BOOT_PROGRESS_KEYFRAMES) {
        if (cancelled) return;
        addBootMessage(keyframe.message);
        setBootProgress(keyframe.target);
        await new Promise((resolve) =>
          window.setTimeout(resolve, shouldReduceMotion ? 60 : keyframe.duration),
        );
      }

      if (!cancelled) {
        setBootPhase("reveal");
      }
    };

    void runProgressSequence();

    return () => {
      cancelled = true;
    };
  }, [bootPhase, setBootPhase, setBootProgress, addBootMessage, shouldReduceMotion]);

  useEffect(() => {
    if (bootPhase !== "reveal") {
      return undefined;
    }

    const duration = shouldReduceMotion ? 200 : BOOT_PHASE_DURATIONS.reveal;
    const timer = window.setTimeout(() => {
      // Mark session as booted for auto-skip on revisit
      if (typeof window !== "undefined") {
        sessionStorage.setItem(BOOT_SESSION_KEY, "1");
      }
      completeBoot();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [bootPhase, completeBoot, shouldReduceMotion]);

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
      // Apply snap if a zone was active when drag ended
      const currentState = useOSStore.getState();

      if (currentState.dragState && currentState.windowSnapZone && desktopBounds) {
        const snapWindowId = currentState.dragState.windowId;
        const zone = currentState.windowSnapZone;

        endWindowDrag();
        snapWindowToZone(snapWindowId, zone, desktopBounds);
      } else {
        endWindowDrag();
      }

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
    snapWindowToZone,
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

  const openStatusBarUrl = useCallback(
    (href: string, target: "_blank" | "_self" = "_blank") => {
      if (typeof window === "undefined") {
        return;
      }

      const isRelativeUrl = href.startsWith("/");

      if (isRelativeUrl) {
        if (target === "_self") {
          window.location.assign(href);
          return;
        }

        window.open(href, target, "noopener,noreferrer");
        return;
      }

      let parsedUrl: URL;

      try {
        parsedUrl = new URL(href);
      } catch {
        return;
      }

      const allowedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

      if (!allowedProtocols.has(parsedUrl.protocol)) {
        return;
      }

      if (target === "_self") {
        window.location.assign(parsedUrl.toString());
        return;
      }

      window.open(parsedUrl.toString(), target, "noopener,noreferrer");
    },
    [],
  );

  const runStatusBarCommandWithContext = useMemo(
    () =>
      createStatusBarCommandRunner({
        bounds: desktopBounds,
        launchApp,
        activateApp,
        openUrl: openStatusBarUrl,
      }),
    [activateApp, desktopBounds, launchApp, openStatusBarUrl],
  );

  const runStatusBarCommand = (actionId: string) => {
    const activeApp = statusBar.activeApp;
    const action = statusBar.menu?.sections
      .flatMap((section) => section.actions)
      .find((entry) => entry.id === actionId);

    if (!action) {
      return;
    }

    const context: StatusBarCommandContext = {
      activeApp,
    };

    void runStatusBarCommandWithContext(action.command, context);
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
    activeApp: activeRuntimeTarget.activeApp,
    activeWindow: activeRuntimeTarget.activeWindow,
    processCount: processes.length,
    bootPhase,
    bootProgress,
    bootMessages,
    desktopBounds,
    selectedDesktopAppId,
    desktopIconPositions,
    aiWidgetPosition,
    dockApps,
    dockMenu,
    minimizedWindows,
    statusBar,
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
    runStatusBarCommand,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleWindowMaximize: toggleDesktopWindowMaximize,
    beginWindowDrag: beginDesktopWindowDrag,
    beginWindowResize: beginDesktopWindowResize,
    windowSnapZone,
  };
}
