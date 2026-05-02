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
import { dispatchFilesFocusNodeRequest } from "@/shared/lib/os-events/files-os-events";
import {
  subscribeToFileSystemChanges,
  isFileSystemChangeWithinPath,
} from "@/shared/lib/fs/fs-events";
import { SYSTEM_SHARED_DIRECTORIES } from "@/shared/lib/fs/fs-paths";

import { useDesktopContextMenu } from "./desktop-context-menu/use-desktop-context-menu";
import { getDesktopItems } from "./desktop-context-menu/desktop-items";
import type { DesktopItem } from "./desktop-context-menu/desktop-context-menu.types";

import {
  DESKTOP_AI_WIDGET,
  DESKTOP_INSETS,
  DOCK_MENU,
  getDesktopIconConfig,
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
  snapToRightAlignedGrid,
} from "./desktop-shell.layout";
import type {
  DesktopIconDragState,
  DesktopWidgetDragState,
  DockMenuAction,
  DockMenuModel,
  WindowRenderItem,
  UseDesktopShellResult,
} from "./desktop-shell.types";
import { useDesktopPointerEvents } from "./use-desktop-pointer-events";
import { useDesktopSelection } from "./use-desktop-selection";
import { useDesktopMarquee } from "./use-desktop-marquee";
import { useDesktopKeyboardNav } from "./use-desktop-keyboard-nav";
import { useBootSequence } from "./use-boot-sequence";

export function useDesktopShell(): UseDesktopShellResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [desktopBounds, setDesktopBounds] = useState<DesktopBounds | null>(null);
  const [desktopIconDragState, setDesktopIconDragState] =
    useState<DesktopIconDragState>(null);
  const [customAiWidgetPosition, setAiWidgetPosition] = useState<WindowPosition | null>(null);
  const [desktopWidgetDragState, setDesktopWidgetDragState] = useState<DesktopWidgetDragState>(null);
  const [iconDropTargetFolderId, setIconDropTargetFolderId] = useState<string | null>(null);
  const [dockMenu, setDockMenu] = useState<DockMenuModel | null>(null);
  const [splitViewPicker, setSplitViewPicker] = useState<{
    workspaceId: string;
    anchorWindowId: string;
    side: "left" | "right";
  } | null>(null);
  const [desktopFsVersion, setDesktopFsVersion] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const activateDesktopApp = useCallback((appId: string) => {
    void useOSStore.getState().activateApp(appId);
  }, []);

  const {
    contextMenuState,
    openDesktopContextMenu,
    closeContextMenu,
    runContextMenuAction,
    desktopSort,
    setDesktopSort,
    desktopViewMode,
    setDesktopViewMode,
  } = useDesktopContextMenu({
    onOpenApp: activateDesktopApp,
  });

  const apps = useOSStore((state) => state.apps);
  const appMap = useOSStore((state) => state.appMap);
  const windows = useOSStore((state) => state.windows);
  const processes = useOSStore((state) => state.processes);
  const windowRecord = useOSStore((state) => state.windowRecord);
  const processRecord = useOSStore((state) => state.processRecord);
  const loadedApps = useOSStore((state) => state.loadedApps);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const currentWorkspaceId = useOSStore((state) => state.currentWorkspaceId);
  const workspaces = useOSStore((state) => state.workspaces);
  const fileDragState = useOSStore((state) => state.fileDragState);
  const fileDropTarget = useOSStore((state) => state.fileDropTarget);
  const sessionHydrated = useOSStore((state) => state.sessionHydrated);
  const fsNodeMap = useOSStore((state) => state.fsNodeMap);
  const fsChildMap = useOSStore((state) => state.fsChildMap);
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

  // Desktop state from store (persisted)
  const desktopIconPositions = useOSStore((state) => state.desktopIconPositions);
  const desktopSelection = useOSStore((state) => state.desktopSelection);
  const desktopSortState = useOSStore((state) => state.desktopSort);
  const desktopHydrated = useOSStore((state) => state.desktopHydrated);
  const setDesktopSelection = useOSStore((state) => state.setDesktopSelection);
  const hydrateDesktopState = useOSStore((state) => state.hydrateDesktopState);
  const persistDesktopPositions = useOSStore((state) => state.persistDesktopPositions);

  // Multi-selection hook (macOS-style)
  const { desktopSelections, handleItemClick: baseHandleItemClick, handleClearSelection: clearDesktopSelections } = useDesktopSelection();

  // Marquee drag-to-select hook
  const { marqueeState, beginMarquee, updateMarquee, endMarquee, cancelMarquee } = useDesktopMarquee();

  const handleMarqueeEnd = useCallback((ids: string[], isAdditive: boolean) => {
    if (isAdditive) {
      const existing = useOSStore.getState().desktopSelections;
      const merged = [...new Set([...existing, ...ids])];
      useOSStore.getState().setDesktopSelections(merged);
    } else {
      useOSStore.getState().setDesktopSelections(ids);
    }
  }, []);

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
        windowRecord,
        processRecord,
      }),
    [activeWindowId, appMap, processes, windowRecord, processRecord, windows],
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

  const syncedDesktopIconPositions = useMemo(
    () => syncDesktopIconPositions(apps, desktopBounds, desktopIconPositions),
    [apps, desktopIconPositions, desktopBounds],
  );

  const desktopItems = useMemo(
    () => getDesktopItems({
      apps,
      fsNodeMap,
      fsChildMap,
      desktopIconPositions: syncedDesktopIconPositions,
      desktopBounds,
      sortConfig: desktopSortState,
      viewMode: desktopViewMode,
    }),
    [apps, fsNodeMap, fsChildMap, syncedDesktopIconPositions, desktopBounds, desktopSortState, desktopFsVersion, desktopViewMode],
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
    if (!desktopBounds || bootPhase !== "ready") {
      return;
    }

    void hydrateDesktopState();
  }, [desktopBounds, bootPhase, hydrateDesktopState]);

  useEffect(() => {
    if (!desktopBounds || !desktopHydrated || bootPhase !== "ready") {
      return;
    }

    const store = useOSStore.getState();
    const currentPositions = store.desktopIconPositions;
    const iconConfig = getDesktopIconConfig(desktopViewMode);

    const newPositions: Record<string, WindowPosition> = {};
    for (const [key, pos] of Object.entries(currentPositions)) {
      newPositions[key] = snapToRightAlignedGrid(pos, desktopBounds, iconConfig.frame, iconConfig.spacing);
    }

    store.setDesktopIconPositions(newPositions);
    void persistDesktopPositions();
  }, [desktopViewMode, desktopBounds, desktopHydrated, bootPhase, persistDesktopPositions]);

  // ── Network connectivity listener ────────────────────────────────────────────
  useEffect(() => {
    const handleOffline = () => {
      useOSStore.getState().pushNotification({
        title: "Network",
        body: "You are offline. Some features may be unavailable.",
        level: "warning",
        appId: "system",
      });
    };

    const handleOnline = () => {
      useOSStore.getState().pushNotification({
        title: "Network",
        body: "You are back online.",
        level: "info",
        appId: "system",
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // ── VFS change listener (desktop-relevant only) ─────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeToFileSystemChanges((detail) => {
      if (isFileSystemChangeWithinPath(detail, SYSTEM_SHARED_DIRECTORIES.desktop)) {
        setDesktopFsVersion((v) => v + 1);
      }
    });

    return unsubscribe;
  }, []);

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
  useBootSequence(
    bootPhase,
    setBootPhase,
    setBootProgress,
    addBootMessage,
    completeBoot,
    hydrateFileSystem,
    hydrateSettings,
  );

  useDesktopPointerEvents({
    desktopBounds,
    desktopIconDragState,
    desktopWidgetDragState,
    splitResizeState,
    updateFileDrag,
    updateSplitResize,
    updateWindowDrag,
    updateWindowResize,
    endWindowDrag,
    endFileDrag,
    endSplitResize,
    endWindowResize,
    snapWindowToZone,
    getContainerPointer,
    setAiWidgetPosition,
    setDesktopIconDragState,
    setDesktopWidgetDragState,
    updateMarquee,
    endMarquee,
    desktopItems,
    handleMarqueeEnd,
    setIconDropTargetFolderId,
  });

  const clearDesktopSelection = clearDesktopSelections;

  const closeDockMenu = () => {
    setDockMenu(null);
  };

  const selectDesktopApp = (appId: string | null) => {
    setDesktopSelection(appId ? `app:${appId}` : null);
  };

  const handleDesktopItemClick = useCallback((itemId: string, event: React.MouseEvent) => {
    const allItemIds = desktopItems.map((item) =>
      item.kind === "app" ? `app:${item.app.id}` : `fs:${item.node.id}`,
    );
    baseHandleItemClick(itemId, event, allItemIds);
  }, [baseHandleItemClick, desktopItems]);

  const openDesktopApp = (appId: string) => {
    if (!desktopBounds) {
      return;
    }

    setDockMenu(null);
    setDesktopSelection(`app:${appId}`);
    void activateApp(appId, desktopBounds);
  };

  const openDesktopItem = (itemId: string) => {
    if (itemId.startsWith("app:")) {
      openDesktopApp(itemId.slice(4));
      return;
    }

    if (!desktopBounds) {
      return;
    }

    const store = useOSStore.getState();
    const nodeId = itemId.slice(3);

    const node = store.fsNodeMap[nodeId];
    if (!node) return;

    dispatchFilesFocusNodeRequest({ nodeId, source: "desktop-icon" });
    void store.activateApp("files");
  };

  useDesktopKeyboardNav(
    desktopItems,
    desktopSelections,
    openDesktopItem,
    desktopBounds,
    desktopViewMode,
  );

  const openAgentPrompt = (prompt: string) => {
    if (!desktopBounds) {
      return;
    }

    openAgentWithPrompt(prompt);
    setDockMenu(null);
    setDesktopSelection("app:ai-agent");
    void activateApp("ai-agent", desktopBounds);
  };

  const launchDesktopApp = (appId: string) => {
    if (!desktopBounds) {
      return;
    }

    setDockMenu(null);
    setDesktopSelection(`app:${appId}`);
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

  const beginDesktopIconDrag = (itemId: string, pointer: WindowPosition) => {
    if (bootPhase !== "ready") {
      return;
    }

    const localPointer = getContainerPointer(pointer);
    const desktopItem = desktopItems.find(
      (di) => (di.kind === "app" ? `app:${di.app.id}` : `fs:${di.node.id}`) === itemId,
    );

    if (!desktopItem) {
      return;
    }

    const currentPosition = desktopItem.position;
    const appId = desktopItem.kind === "app" ? desktopItem.app.id : desktopItem.node.id;

    const store = useOSStore.getState();
    const selections = store.desktopSelections;

    const initialPositions: Record<string, WindowPosition> = {};

    if (selections.length > 1 && selections.includes(itemId)) {
      const currentPositions = store.desktopIconPositions;
      for (const selectionId of selections) {
        const storeKey = selectionId.startsWith("app:")
          ? selectionId.slice(4)
          : selectionId.startsWith("fs:")
            ? selectionId.slice(3)
            : selectionId;
        const savedPos = currentPositions[storeKey];
        if (savedPos) {
          initialPositions[storeKey] = { ...savedPos };
        } else {
          const computedItem = desktopItems.find(
            (di) => (di.kind === "app" ? `app:${di.app.id}` : `fs:${di.node.id}`) === selectionId,
          );
          if (computedItem) {
            initialPositions[storeKey] = { ...computedItem.position };
          }
        }
      }
    } else {
      setDesktopSelection(itemId);
      initialPositions[appId] = { ...currentPosition };
    }

    setDesktopIconDragState({
      appId,
      offset: {
        x: localPointer.x - currentPosition.x,
        y: localPointer.y - currentPosition.y,
      },
      initialPositions,
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

    const anchorWindow = windowRecord[windowId];

    if (!anchorWindow) {
      return;
    }

    if (!anchorWindow.isFullscreen) {
      toggleWindowFullscreen(windowId, {
        width: desktopBounds.width,
        height: desktopBounds.height,
      });
    }

    const runtimeWindow = useOSStore.getState().windowRecord[windowId];

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
            const runtimeWindow = windowRecord[window.id];

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
    selectedDesktopAppId: desktopSelection?.startsWith("app:") ? desktopSelection.slice(4) : null,
    desktopSelections,
    desktopItems,
    desktopIconPositions: syncedDesktopIconPositions,
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
    iconDropTargetFolderId,
    fileDragNodeId: fileDragState?.nodeId ?? null,
    fileDropTarget,
    statusBar,
    visibleWindows,
    workspaceRenderItems,
    clearDesktopSelection,
    closeDockMenu,
    selectDesktopApp,
    handleItemClick: handleDesktopItemClick,
    openDesktopApp,
    openDesktopItem,
    openAgentPrompt,
    beginAiWidgetDrag,
    beginDesktopIconDrag,
    openDockMenu,
    runDockMenuAction,
    runStatusBarCommand,
    contextMenuState,
    openDesktopContextMenu,
    closeContextMenu,
    runContextMenuAction,
    desktopSort,
    desktopViewMode,
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
    marqueeState,
    beginMarquee,
    handleMarqueeEnd,
  };
}
