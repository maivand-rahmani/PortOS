"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import {
  getActiveRuntimeTarget,
  getWorkspaceById,
  getWorkspaceIndex,
  isFullscreenWorkspace as isFullscreenWorkspaceModel,
  serializeSessionModel,
  useOSStore,
} from "@/processes";
import type { DesktopBounds, WindowPosition } from "@/entities/window";
import { openAgentWithPrompt } from "@/apps/ai-agent/model/external";

import { runDataMigration } from "@/shared/lib/fs/fs-migration";
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
  sortWorkspaces,
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
  const dragRafRef = useRef<number | null>(null);
  const pendingPointerEventRef = useRef<PointerEvent | null>(null);
  const [desktopBounds, setDesktopBounds] = useState<DesktopBounds | null>(null);
  const [selectedDesktopAppId, setSelectedDesktopAppId] = useState<string | null>(null);
  const [customDesktopIconPositions, setDesktopIconPositions] = useState<DesktopIconMap>({});
  const [desktopIconDragState, setDesktopIconDragState] =
    useState<DesktopIconDragState>(null);
  const [customAiWidgetPosition, setAiWidgetPosition] = useState<WindowPosition | null>(null);
  const [desktopWidgetDragState, setDesktopWidgetDragState] = useState<DesktopWidgetDragState>(null);
  const [dockMenu, setDockMenu] = useState<DockMenuModel | null>(null);
  const [splitViewPicker, setSplitViewPicker] = useState<{
    workspaceId: string;
    anchorWindowId: string;
    side: "left" | "right";
  } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const apps = useOSStore((state) => state.apps);
  const appMap = useOSStore((state) => state.appMap);
  const windows = useOSStore((state) => state.windows);
  const processes = useOSStore((state) => state.processes);
  const loadedApps = useOSStore((state) => state.loadedApps);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const currentWorkspaceId = useOSStore((state) => state.currentWorkspaceId);
  const workspaces = useOSStore((state) => state.workspaces);
  const fileDragState = useOSStore((state) => state.fileDragState);
  const fileDropTarget = useOSStore((state) => state.fileDropTarget);
  const sessionHydrated = useOSStore((state) => state.sessionHydrated);
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
  const hydrateSession = useOSStore((state) => state.hydrateSession);
  const persistSessionSnapshot = useOSStore((state) => state.persistSessionSnapshot);
  const activateApp = useOSStore((state) => state.activateApp);
  const switchWorkspace = useOSStore((state) => state.switchWorkspace);
  const createDesktop = useOSStore((state) => state.createDesktop);
  const closeFullscreenSpace = useOSStore((state) => state.closeFullscreenSpace);
  const beginFileDrag = useOSStore((state) => state.beginFileDrag);
  const updateFileDrag = useOSStore((state) => state.updateFileDrag);
  const setFileDropTarget = useOSStore((state) => state.setFileDropTarget);
  const endFileDrag = useOSStore((state) => state.endFileDrag);
  const focusWindow = useOSStore((state) => state.focusWindow);
  const closeWindow = useOSStore((state) => state.closeWindow);
  const minimizeWindow = useOSStore((state) => state.minimizeWindow);
  const restoreWindow = useOSStore((state) => state.restoreWindow);
  const launchApp = useOSStore((state) => state.launchApp);
  const terminateProcess = useOSStore((state) => state.terminateProcess);
  const toggleWindowMaximize = useOSStore((state) => state.toggleWindowMaximize);
  const toggleWindowFullscreen = useOSStore((state) => state.toggleWindowFullscreen);
  const beginWindowDrag = useOSStore((state) => state.beginWindowDrag);
  const updateWindowDrag = useOSStore((state) => state.updateWindowDrag);
  const endWindowDrag = useOSStore((state) => state.endWindowDrag);
  const beginSplitResize = useOSStore((state) => state.beginSplitViewResize);
  const updateSplitResize = useOSStore((state) => state.updateSplitViewResize);
  const endSplitResize = useOSStore((state) => state.endSplitViewResize);
  const enterSplitView = useOSStore((state) => state.enterSplitView);
  const snapWindowToZone = useOSStore((state) => state.snapWindowToZone);
  const windowSnapZone = useOSStore((state) => state.windowSnapZone);
  const dragState = useOSStore((state) => state.dragState);
  const splitResizeState = useOSStore((state) => state.splitResizeState);
  const beginWindowResize = useOSStore((state) => state.beginWindowResize);
  const updateWindowResize = useOSStore((state) => state.updateWindowResize);
  const endWindowResize = useOSStore((state) => state.endWindowResize);
  const resizeWindowsToBounds = useOSStore((state) => state.resizeWindowsToBounds);

  const visibleWindows = useMemo<WindowRenderItem[]>(
    () =>
      [...windows]
        .filter((window) => window.workspaceId === currentWorkspaceId)
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
    [
      activeWindowId,
      appMap,
      currentWorkspaceId,
      dragWindowId,
      loadedApps,
      resizeWindowId,
      windows,
    ],
  );

  const orderedWorkspaces = useMemo(() => sortWorkspaces(workspaces), [workspaces]);

  const workspaceRenderItems = useMemo(
    () =>
      orderedWorkspaces.map((workspace) => ({
        workspace,
        isActive: workspace.id === currentWorkspaceId,
        windows: [...windows]
          .filter((window) => window.workspaceId === workspace.id)
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
      })),
    [
      activeWindowId,
      appMap,
      currentWorkspaceId,
      dragWindowId,
      loadedApps,
      orderedWorkspaces,
      resizeWindowId,
      windows,
    ],
  );

  const currentWorkspaceIndex = useMemo(
    () => Math.max(0, getWorkspaceIndex(orderedWorkspaces, currentWorkspaceId)),
    [currentWorkspaceId, orderedWorkspaces],
  );

  const currentWorkspace = useMemo(
    () => getWorkspaceById(orderedWorkspaces, currentWorkspaceId),
    [currentWorkspaceId, orderedWorkspaces],
  );

  const isFullscreenWorkspace = isFullscreenWorkspaceModel(currentWorkspace);
  const currentSplitView = currentWorkspace?.splitView ?? null;
  const splitViewCandidates = apps.filter((app) => app.id !== "settings");

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
    () => getDockAppStates(apps, windows, activeWindowId, currentWorkspaceId),
    [activeWindowId, apps, currentWorkspaceId, windows],
  );

  const desktopIconPositions = useMemo(
    () => syncDesktopIconPositions(apps, desktopBounds, customDesktopIconPositions),
    [apps, customDesktopIconPositions, desktopBounds],
  );

  const minimizedWindows = useMemo(
    () =>
      windows.filter(
        (window) => window.isMinimized && window.workspaceId === currentWorkspaceId,
      ),
    [currentWorkspaceId, windows],
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
    if (!desktopBounds || sessionHydrated) {
      return;
    }

    void hydrateSession(desktopBounds);
  }, [desktopBounds, hydrateSession, sessionHydrated]);

  useEffect(() => {
    if (!sessionHydrated || bootPhase !== "ready") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const snapshot = serializeSessionModel({
        workspaces: useOSStore.getState().workspaces,
        windows: useOSStore.getState().windows,
        activeWindowId: useOSStore.getState().activeWindowId,
        currentWorkspaceId: useOSStore.getState().currentWorkspaceId,
      });

      void persistSessionSnapshot(snapshot);
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeWindowId,
    bootPhase,
    currentWorkspaceId,
    persistSessionSnapshot,
    sessionHydrated,
    windows,
  ]);

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

    const processPointerEvent = (event: PointerEvent) => {
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

      updateFileDrag(nextPointer);
      if (splitResizeState) {
        updateSplitResize(nextPointer.x, desktopBounds);
      }
      updateWindowDrag(nextPointer, desktopBounds);
      updateWindowResize(nextPointer, desktopBounds);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pendingPointerEventRef.current = event;

      if (dragRafRef.current === null) {
        dragRafRef.current = requestAnimationFrame(() => {
          dragRafRef.current = null;
          const latest = pendingPointerEventRef.current;

          if (latest) {
            pendingPointerEventRef.current = null;
            processPointerEvent(latest);
          }
        });
      }
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

      endFileDrag();
      endSplitResize();
      endWindowResize();
      setDesktopIconDragState(null);
      setDesktopWidgetDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
    };
  }, [
    desktopBounds,
    desktopIconDragState,
    desktopWidgetDragState,
      endWindowDrag,
      endFileDrag,
      endSplitResize,
      endWindowResize,
      snapWindowToZone,
      splitResizeState,
      updateSplitResize,
      updateFileDrag,
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

  const toggleDesktopWindowFullscreen = (windowId: string) => {
    if (!desktopBounds) {
      return;
    }

    toggleWindowFullscreen(windowId, {
      width: desktopBounds.width,
      height: desktopBounds.height,
    });
  };

  const openSplitViewPicker = (windowId: string, side: "left" | "right") => {
    if (!desktopBounds) {
      return;
    }

    const anchorWindow = windows.find((window) => window.id === windowId);

    if (!anchorWindow) {
      return;
    }

    if (!anchorWindow.isFullscreen) {
      toggleWindowFullscreen(windowId, {
        width: desktopBounds.width,
        height: desktopBounds.height,
      });
    }

    const runtimeWindow = useOSStore.getState().windows.find((window) => window.id === windowId);

    setSplitViewPicker({
      workspaceId: runtimeWindow?.workspaceId ?? anchorWindow.workspaceId,
      anchorWindowId: windowId,
      side,
    });
  };

  const closeSplitViewPicker = () => {
    setSplitViewPicker(null);
  };

  const chooseSplitViewApp = (appId: string) => {
    if (!desktopBounds || !splitViewPicker) {
      return;
    }

    const candidateWindow = [...windows]
      .filter((window) => window.appId === appId && window.id !== splitViewPicker.anchorWindowId)
      .sort((left, right) => right.zIndex - left.zIndex)[0];

    if (candidateWindow) {
      enterSplitView(
        splitViewPicker.anchorWindowId,
        candidateWindow.id,
        splitViewPicker.side,
        desktopBounds,
      );
      setSplitViewPicker(null);
      return;
    }

    void launchApp(appId, desktopBounds).then((windowId) => {
      if (!windowId) {
        return;
      }

      enterSplitView(
        splitViewPicker.anchorWindowId,
        windowId,
        splitViewPicker.side,
        desktopBounds,
      );
      setSplitViewPicker(null);
    });
  };

  const beginSplitViewResize = (pointerX: number) => {
    if (!currentSplitView) {
      return;
    }

    beginSplitResize(currentWorkspaceId, getContainerPointer({ x: pointerX, y: 0 }).x);
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
    currentWorkspaceId,
    workspaces,
    currentWorkspaceIndex,
    isFullscreenWorkspace,
    currentSplitView,
    splitViewPicker,
    splitViewCandidates,
    fileDragNodeId: fileDragState?.nodeId ?? null,
    fileDropTarget,
    statusBar,
    visibleWindows,
    workspaceRenderItems,
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
    switchWorkspace,
    createDesktop,
    closeFullscreenSpace,
    beginFileDrag,
    setFileDropTarget,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleWindowMaximize: toggleDesktopWindowMaximize,
    toggleWindowFullscreen: toggleDesktopWindowFullscreen,
    openSplitViewPicker,
    closeSplitViewPicker,
    chooseSplitViewApp,
    beginSplitViewResize,
    beginWindowDrag: beginDesktopWindowDrag,
    beginWindowResize: beginDesktopWindowResize,
    windowSnapZone,
  };
}
