"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  useOSStore,
  type FileDropTarget,
} from "@/processes";
import { getNodePath } from "@/processes/os/model/file-system";
import { dispatchOpenFileRequest } from "@/shared/lib/os-events/fs-os-events";
import { dispatchFilesFocusNodeRequest } from "@/shared/lib/os-events/files-os-events";
import { useAppSwitcher } from "../../model/use-app-switcher";
import {
  FULLSCREEN_CHROME_EDGE_THRESHOLD,
  FULLSCREEN_CHROME_HIDE_DELAY,
  WORKSPACE_TRACK_TRANSITION,
} from "../../model/desktop-shell.constants";
import { useAiCommandPaletteShortcut } from "../../model/use-ai-command-palette";
import { useDesktopShell } from "../../model/use-desktop-shell";
import { useMissionControl } from "../../model/use-mission-control";
import { useKeyboardShortcuts } from "../../model/use-keyboard-shortcuts";
import { useDefaultShortcuts } from "../../model/use-default-shortcuts";
import { useSystemShortcuts } from "../../model/use-system-shortcuts";
import { DesktopWallpaper } from "../desktop-wallpaper";
import { FileDropOverlay } from "../file-drop-overlay/file-drop-overlay";
import { DockMenu } from "../dock-menu";
import { DesktopContextMenu } from "../desktop-context-menu";
import { DesktopRenameInput } from "../desktop-rename-input";
import { SnapGuideOverlay } from "../snap-guide-overlay/snap-guide-overlay";
import { SplitViewDivider } from "../split-view-divider/split-view-divider";
import { SplitViewPicker } from "../split-view-picker/split-view-picker";
import { WindowErrorBoundary } from "@/shared/ui/window-error-boundary";
import { WindowSurface } from "../window-surface";
import { OverlayShell } from "../overlay-shell";
import { DesktopIconsShell } from "../desktop-icons-shell";
import { DesktopMarquee } from "../desktop-marquee";
import { DockShell } from "../dock-shell";
import { MenuBarShell } from "../menu-bar-shell";
import { NotificationShell } from "../notification-shell";

export function DesktopShell() {
  const [isSpotlightOpen, setSpotlightOpen] = useState(false);
  const [isNotificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const isInteractiveKeyboardTarget = useCallback((target: HTMLElement | null) => {
    if (!target) {
      return false;
    }

    if (target.isContentEditable) {
      return true;
    }

    return Boolean(
      target.closest(
        "input, textarea, select, button, a[href], label, summary, [contenteditable=''], [contenteditable='true'], [role='button'], [role='link'], [role='menuitem']",
      ),
    );
  }, []);

  const toggleSpotlight = useCallback(() => {
    setSpotlightOpen((prev) => !prev);
  }, []);

  const toggleNotificationCenter = useCallback(() => {
    setNotificationCenterOpen((prev) => !prev);
  }, []);

  const {
    containerRef,
    apps,
    activeWindow,
    bootPhase,
    bootProgress,
    bootMessages,
    selectedDesktopAppId,
    desktopSelections,
    desktopItems,
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
    iconDropTargetFolderId,
    fileDragNodeId,
    fileDropTarget,
    statusBar,
    visibleWindows,
    workspaceRenderItems,
    clearDesktopSelection,
    closeDockMenu,
    selectDesktopApp,
    handleItemClick,
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
    setFileDropTarget,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleWindowMaximize,
    toggleWindowFullscreen,
    openSplitViewPicker,
    closeSplitViewPicker,
    chooseSplitViewApp,
    beginSplitViewResize,
    beginWindowDrag,
    beginWindowResize,
    windowSnapZone,
    desktopBounds,
    marqueeState,
    beginMarquee,
    handleMarqueeEnd,
  } = useDesktopShell();

  const dockAutohide = useOSStore((state) => state.osSettings.dockAutohide);
  const appMap = useOSStore((state) => state.appMap);
  const fsNodeMap = useOSStore((state) => state.fsNodeMap);
  const notifications = useOSStore((state) => state.notifications);
  const activeToastIds = useOSStore((state) => state.activeToastIds);
  const pushNotification = useOSStore((state) => state.pushNotification);
  const dismissToast = useOSStore((state) => state.dismissToast);
  const removeNotification = useOSStore((state) => state.removeNotification);
  const markNotificationRead = useOSStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useOSStore((state) => state.markAllNotificationsRead);
  const clearAllNotifications = useOSStore((state) => state.clearAllNotifications);
  const desktopRenameState = useOSStore((state) => state.desktopRenameState);
  const startDesktopRename = useOSStore((state) => state.startDesktopRename);
  const cancelDesktopRename = useOSStore((state) => state.cancelDesktopRename);
  const fsRenameNode = useOSStore((state) => state.fsRenameNode);
  const fsChildMap = useOSStore((state) => state.fsChildMap);
  const shouldReduceMotion = useReducedMotion();
  const [isMenuBarRevealed, setMenuBarRevealed] = useState(false);
  const [isDockRevealed, setDockRevealed] = useState(false);
  const isBooting = bootPhase !== "ready";
  const closeDesktopTransientUi = useCallback(() => {
    closeDockMenu();
    closeContextMenu();
    clearDesktopSelection();
  }, [clearDesktopSelection, closeDockMenu, closeContextMenu]);
  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );
  const hasReadyNotification = notifications.some(
    (item) => item.title === "PortOS is ready" && item.appId === undefined,
  );
  const activeToasts = useMemo(
    () =>
      activeToastIds
        .map((id) => notifications.find((item) => item.id === id) ?? null)
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [activeToastIds, notifications],
  );
  const appSwitcher = useAppSwitcher({
    bootReady: bootPhase === "ready",
    dockApps,
    onActivateApp: openDesktopApp,
  });
  const {
    isOpen: isAppSwitcherOpen,
    selectedAppId: selectedSwitcherAppId,
    switcherApps,
    openAppSwitcher: showAppSwitcher,
    cycleAppSwitcher: runAppSwitcherCycle,
    previewApp: previewSwitcherApp,
    activateSelectedApp,
  } = appSwitcher;
  const {
    isOpen: isMissionControlOpen,
    highlightedWorkspaceId,
    selectedWindowId,
    openMissionControl,
    closeMissionControl,
    highlightWorkspace,
    moveHighlight,
    commitWorkspace,
    commitWindow,
    confirmSelection,
  } = useMissionControl({
    currentWorkspaceId,
    workspaces: workspaceRenderItems,
    onCommitWorkspace: switchWorkspace,
    onCommitWindow: focusWindow,
  });

  const openAppSwitcher = useCallback(() => {
    if (switcherApps.length === 0) {
      pushNotification({
        title: "No running apps",
        body: "Launch an app first to use the switcher. Use Spotlight or the dock to open one.",
        level: "info",
      });
      return;
    }

    showAppSwitcher();
  }, [pushNotification, showAppSwitcher, switcherApps.length]);

  const cycleAppSwitcher = useCallback(
    (direction: 1 | -1) => {
      if (switcherApps.length === 0) {
        pushNotification({
          title: "No running apps",
          body: "Launch an app first to use the switcher. Use Spotlight or the dock to open one.",
          level: "info",
        });
        return;
      }

      runAppSwitcherCycle(direction);
    },
    [pushNotification, runAppSwitcherCycle, switcherApps.length],
  );

  const { openAiPaletteFromActiveContext } = useAiCommandPaletteShortcut({
    activeWindow,
    isBooting,
    onBeforeSurfaceOpen: closeDesktopTransientUi,
  });

  const { runSystemShortcut } = useSystemShortcuts({
    isBooting,
    isSpotlightOpen,
    isNotificationCenterOpen,
    isAppSwitcherOpen,
    isMissionControlOpen,
    isInteractiveKeyboardTarget,
    onBeforeSurfaceOpen: closeDesktopTransientUi,
    onToggleSpotlight: toggleSpotlight,
    onOpenMissionControl: openMissionControl,
    onCycleAppSwitcher: cycleAppSwitcher,
    onOpenAiPaletteFromActiveContext: openAiPaletteFromActiveContext,
  });

  const allDesktopItemIds = useMemo(
    () => desktopItems.map((item) =>
      item.kind === "app" ? `app:${item.app.id}` : `fs:${item.node.id}`,
    ),
    [desktopItems],
  );

  useKeyboardShortcuts();
  useDefaultShortcuts({ allItemIds: allDesktopItemIds });

  const resolveDropTarget = useCallback(
    (targetAppId: string, windowId: string): FileDropTarget | null => {
      if (targetAppId === "editor" || targetAppId === "files") {
        return {
          appId: targetAppId,
          windowId,
        };
      }

      return null;
    },
    [],
  );

  const handleFileDrop = useCallback(
    async (dropTarget: FileDropTarget) => {
      if (!fileDragNodeId) {
        return;
      }

      const node = fsNodeMap[fileDragNodeId];

      if (!node || node.type !== "file") {
        return;
      }

      if (dropTarget.appId === "editor") {
        focusWindow(dropTarget.windowId);
        dispatchOpenFileRequest({
          nodeId: node.id,
          path: getNodePath(node.id, fsNodeMap),
          mode: "edit",
          source: "file-drag",
          targetWindowId: dropTarget.windowId,
        });
        pushNotification({
          title: `Opened ${node.name}`,
          body: "File dropped into Editor.",
          level: "success",
          appId: "editor",
        });
        return;
      }

      if (dropTarget.appId === "files") {
        focusWindow(dropTarget.windowId);
        dispatchFilesFocusNodeRequest({
          nodeId: node.id,
          source: "file-drag",
          targetWindowId: dropTarget.windowId,
        });
        pushNotification({
          title: `Focused ${node.name}`,
          body: "File revealed in Files.",
          level: "success",
          appId: "files",
        });
      }
    },
    [fileDragNodeId, focusWindow, fsNodeMap, pushNotification],
  );

  useEffect(() => {
    if (!fileDragNodeId) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const hoveredWindow = [...visibleWindows]
        .reverse()
        .find(({ window }) => {
          return (
            event.clientX >= window.position.x &&
            event.clientX <= window.position.x + window.size.width &&
            event.clientY >= window.position.y &&
            event.clientY <= window.position.y + window.size.height
          );
        });

      setFileDropTarget(
        hoveredWindow ? resolveDropTarget(hoveredWindow.window.appId, hoveredWindow.window.id) : null,
      );
    };

    const handlePointerUp = () => {
      if (fileDropTarget) {
        void handleFileDrop(fileDropTarget);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { capture: true });
    window.addEventListener("pointerup", handlePointerUp, { capture: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
      window.removeEventListener("pointerup", handlePointerUp, { capture: true });
    };
  }, [fileDragNodeId, fileDropTarget, handleFileDrop, resolveDropTarget, setFileDropTarget, visibleWindows]);

  // Enter key triggers rename on selected FS item
  useEffect(() => {
    if (isBooting) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      if (desktopRenameState) return;

      const target = event.target as HTMLElement | null;
      if (isInteractiveKeyboardTarget(target)) return;

      const selections = useOSStore.getState().desktopSelections;
      if (selections.length !== 1) return;

      const selectedId = selections[0];
      if (!selectedId.startsWith("fs:")) return;

      const nodeId = selectedId.slice(3);
      const node = useOSStore.getState().fsNodeMap[nodeId];
      if (!node) return;

      event.preventDefault();
      useOSStore.getState().startDesktopRename(nodeId, node.name);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isBooting, desktopRenameState, isInteractiveKeyboardTarget]);

  useEffect(() => {
    if (bootPhase !== "ready" || hasReadyNotification) {
      return;
    }

    pushNotification({
      title: "PortOS is ready",
      body: "System AI and Mission Control are ready. Press Space then K for AI, or press Space twice for Mission Control.",
      level: "success",
    });
  }, [bootPhase, hasReadyNotification, pushNotification]);

  const hasDirtyWindows = useOSStore((s) => s.hasDirtyWindows);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!hasDirtyWindows) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasDirtyWindows]);

  useEffect(() => {
    if (isBooting) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMissionControlOpen) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft": {
          event.preventDefault();
          event.stopPropagation();
          moveHighlight(-1);
          return;
        }
        case "ArrowRight": {
          event.preventDefault();
          event.stopPropagation();
          moveHighlight(1);
          return;
        }
        case "Enter": {
          event.preventDefault();
          event.stopPropagation();
          confirmSelection();
          return;
        }
        case "Escape": {
          event.preventDefault();
          event.stopPropagation();
          closeMissionControl();
          return;
        }
        case " ": {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [closeMissionControl, confirmSelection, isBooting, isMissionControlOpen, moveHighlight]);

  useEffect(() => {
    if (activeToasts.length === 0) {
      return undefined;
    }

    const timeoutIds = activeToasts.map((toast, index) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, 4200 + index * 180),
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [activeToasts, dismissToast]);

  useEffect(() => {
    if (!isNotificationCenterOpen) {
      return;
    }

    markAllNotificationsRead();
  }, [isNotificationCenterOpen, markAllNotificationsRead]);

  useEffect(() => {
    if (!isFullscreenWorkspace) {
      return undefined;
    }

    let menuTimer: number | null = null;
    let dockTimer: number | null = null;

    const clearTimers = () => {
      if (menuTimer) {
        window.clearTimeout(menuTimer);
        menuTimer = null;
      }

      if (dockTimer) {
        window.clearTimeout(dockTimer);
        dockTimer = null;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const nearTop = event.clientY <= FULLSCREEN_CHROME_EDGE_THRESHOLD;
      const nearBottom = window.innerHeight - event.clientY <= FULLSCREEN_CHROME_EDGE_THRESHOLD;

      if (nearTop || isNotificationCenterOpen) {
        if (menuTimer) {
          window.clearTimeout(menuTimer);
          menuTimer = null;
        }
        setMenuBarRevealed(true);
      } else if (!menuTimer) {
        menuTimer = window.setTimeout(() => {
          setMenuBarRevealed(false);
          menuTimer = null;
        }, FULLSCREEN_CHROME_HIDE_DELAY);
      }

      if (nearBottom) {
        if (dockTimer) {
          window.clearTimeout(dockTimer);
          dockTimer = null;
        }
        setDockRevealed(true);
      } else if (!dockTimer) {
        dockTimer = window.setTimeout(() => {
          setDockRevealed(false);
          dockTimer = null;
        }, FULLSCREEN_CHROME_HIDE_DELAY);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      clearTimers();
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isFullscreenWorkspace, isNotificationCenterOpen]);

  const showMenuBar = !isFullscreenWorkspace || isMenuBarRevealed || isNotificationCenterOpen;
  const showDock = !isFullscreenWorkspace || isDockRevealed;
  const showDesktopChrome = !isFullscreenWorkspace;
  const trackAnimate = shouldReduceMotion
    ? { x: `-${currentWorkspaceIndex * 100}vw` }
    : { x: `-${currentWorkspaceIndex * 100}vw` };
  const currentWorkspaceTopZIndex = visibleWindows.at(-1)?.window.zIndex ?? 0;
  const splitDividerZIndex = currentWorkspaceTopZIndex + 8;
  const splitPickerZIndex = currentWorkspaceTopZIndex + 12;

  const desktopRenameItemPosition = useMemo(() => {
    if (!desktopRenameState) return null;
    const item = desktopItems.find(
      (di) => (di.kind === "fs-item" ? `fs:${di.node.id}` : "") === `fs:${desktopRenameState.itemId}`,
    );
    return item?.position ?? null;
  }, [desktopRenameState, desktopItems]);

  const desktopRenameSiblingNames = useMemo(() => {
    if (!desktopRenameState) return [];
    const desktopChildIds = fsChildMap["dir-desktop"] ?? [];
    return desktopChildIds
      .filter((id) => id !== desktopRenameState.itemId)
      .map((id) => fsNodeMap[id]?.name ?? "")
      .filter(Boolean);
  }, [desktopRenameState, fsChildMap, fsNodeMap]);

  const handleRenameItem = useCallback(
    (itemId: string) => {
      const nodeId = itemId.startsWith("fs:") ? itemId.slice(3) : itemId;
      const node = fsNodeMap[nodeId];
      if (!node) return;
      startDesktopRename(nodeId, node.name);
    },
    [fsNodeMap, startDesktopRename],
  );

  const handleRenameCommit = useCallback(
    (newName: string) => {
      const state = useOSStore.getState();
      const renameState = state.desktopRenameState;
      if (!renameState) return;
      void state.fsRenameNode(renameState.itemId, newName);
      state.cancelDesktopRename();
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;

        if (target.closest("button") || target.closest("article")) {
          return;
        }

        closeDockMenu();
        closeContextMenu();

        const rect = containerRef.current?.getBoundingClientRect();
        beginMarquee(
          {
            x: event.clientX - (rect?.left ?? 0),
            y: event.clientY - (rect?.top ?? 0),
          },
          event.metaKey,
        );
      }}
      onContextMenu={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("button") || target.closest("article") || target.closest("[role='menuitem']")) {
          return;
        }
        event.preventDefault();
        openDesktopContextMenu(
          { x: event.clientX, y: event.clientY },
          { kind: "desktop" },
        );
      }}
    >
      <DesktopWallpaper />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(10,132,255,0.18),transparent_30%)]" />

      <MenuBarShell
        isBooting={isBooting}
        showMenuBar={showMenuBar}
        isFullscreenWorkspace={isFullscreenWorkspace}
        statusBar={statusBar}
        unreadNotificationCount={unreadNotificationCount}
        shouldReduceMotion={shouldReduceMotion ?? false}
        onRunStatusBarCommand={runStatusBarCommand}
        onOpenDesktopApp={openDesktopApp}
        onOpenAiPaletteFromActiveContext={openAiPaletteFromActiveContext}
        onOpenAppSwitcher={openAppSwitcher}
        onToggleNotifications={toggleNotificationCenter}
      />

      <main className="relative h-screen w-full">
        <div className="absolute inset-0 z-10 pointer-events-none">
          <DesktopIconsShell
            showDesktopChrome={showDesktopChrome}
            isBooting={isBooting}
            items={desktopItems}
            selectedItemIds={desktopSelections}
            dropTargetFolderId={iconDropTargetFolderId}
            aiWidgetPosition={aiWidgetPosition}
            shouldReduceMotion={shouldReduceMotion ?? false}
            onSelectItem={handleItemClick}
            onOpenItem={openDesktopItem}
            onOpenAgentPrompt={openAgentPrompt}
            onBeginAiWidgetDrag={beginAiWidgetDrag}
            onBeginDesktopIconDrag={beginDesktopIconDrag}
            onRenameItem={handleRenameItem}
            onContextMenuItem={(itemId, event) => {
              const item = desktopItems.find(
                (di) => (di.kind === "app" ? `app:${di.app.id}` : `fs:${di.node.id}`) === itemId,
              );
              if (!item) return;
              openDesktopContextMenu(
                { x: event.clientX, y: event.clientY },
                { kind: "desktop-item", desktopItem: item },
              );
            }}
          />
        </div>

        <DesktopMarquee state={marqueeState} />

        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="flex h-full w-full"
            animate={trackAnimate}
            transition={shouldReduceMotion ? { duration: 0 } : WORKSPACE_TRACK_TRANSITION}
            style={{ width: `${workspaceRenderItems.length * 100}vw` }}
          >
            {workspaceRenderItems.map(({ workspace, windows }) => (
              <div key={workspace.id} className="relative h-full shrink-0 grow-0 basis-[100vw]">
                <div className="absolute inset-0 pointer-events-none">
                  <AnimatePresence>
                    {windows.map(({ window, app, AppComponent, isActive, isDragging, isResizing }) => (
                      <WindowSurface
                        key={window.id}
                        window={window}
                        isActive={isActive}
                        isDragging={isDragging}
                        isResizing={isResizing}
                        onFocus={() => focusWindow(window.id)}
                        onClose={() => closeWindow(window.id)}
                        onMinimize={() => minimizeWindow(window.id)}
                        onToggleMaximize={() => toggleWindowFullscreen(window.id)}
                        onEnterSplitView={
                          workspace.id === currentWorkspaceId && workspace.kind === "fullscreen"
                            ? (side) => openSplitViewPicker(window.id, side)
                            : undefined
                        }
                        onHeaderDoubleClick={() => toggleWindowMaximize(window.id)}
                        onDragStart={(pointer) => beginWindowDrag(window.id, pointer)}
                        onResizeStart={(direction, pointer) =>
                          beginWindowResize(window.id, direction, pointer)
                        }
                      >
                        {AppComponent ? (
                          <WindowErrorBoundary
                            appName={app.name}
                            windowTitle={window.title}
                            onClose={() => closeWindow(window.id)}
                          >
                            <AppComponent processId={window.processId} windowId={window.id} />
                          </WindowErrorBoundary>
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted">
                            Loading {app.name}...
                          </div>
                        )}
                      </WindowSurface>
                    ))}
                  </AnimatePresence>

                  {workspace.id === currentWorkspaceId && currentSplitView ? (
                    <SplitViewDivider
                      leftWidth={Math.round(window.innerWidth * currentSplitView.ratio)}
                      zIndex={splitDividerZIndex}
                      onPointerDown={beginSplitViewResize}
                    />
                  ) : null}

                  {workspace.id === currentWorkspaceId && splitViewPicker ? (
                    <div
                      className="pointer-events-auto absolute inset-y-0"
                      style={
                        splitViewPicker.side === "left"
                          ? { left: 0, width: "50%", zIndex: splitPickerZIndex }
                          : { right: 0, width: "50%", zIndex: splitPickerZIndex }
                      }
                    >
                      <SplitViewPicker
                        apps={splitViewCandidates}
                        side={splitViewPicker.side}
                        onChooseApp={chooseSplitViewApp}
                        onCancel={closeSplitViewPicker}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        </div>

        <div className="absolute inset-0 z-30 pointer-events-none">
          <SnapGuideOverlay zone={windowSnapZone} bounds={desktopBounds} />
          <FileDropOverlay
            fileDragNodeId={fileDragNodeId}
            fileDropTarget={fileDropTarget}
            windows={visibleWindows}
          />

          <AnimatePresence>
            {dockMenu ? <DockMenu menu={dockMenu} onAction={runDockMenuAction} /> : null}
            {contextMenuState.isOpen ? (
              <DesktopContextMenu
                state={contextMenuState}
                onAction={runContextMenuAction}
                onClose={closeContextMenu}
                currentSort={desktopSort}
                currentViewMode={desktopViewMode}
              />
            ) : null}
            {desktopRenameState && desktopRenameItemPosition ? (
              <DesktopRenameInput
                itemId={desktopRenameState.itemId}
                currentName={desktopRenameState.currentName}
                position={desktopRenameItemPosition}
                siblingNames={desktopRenameSiblingNames}
                onCommit={handleRenameCommit}
                onCancel={cancelDesktopRename}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      <DockShell
        isBooting={isBooting}
        showDock={showDock}
        dockApps={dockApps}
        minimizedWindows={minimizedWindows}
        apps={apps}
        dockAutohide={dockAutohide}
        isFullscreenWorkspace={isFullscreenWorkspace}
        shouldReduceMotion={shouldReduceMotion ?? false}
        onActivateApp={openDesktopApp}
        onOpenMenu={openDockMenu}
        onRestoreWindow={restoreWindow}
      />

      <OverlayShell
        isBooting={isBooting}
        bootPhase={bootPhase as Exclude<typeof bootPhase, "ready">}
        bootProgress={bootProgress}
        bootMessages={bootMessages}
        isAppSwitcherOpen={isAppSwitcherOpen}
        switcherApps={switcherApps}
        selectedSwitcherAppId={selectedSwitcherAppId}
        isMissionControlOpen={isMissionControlOpen}
        workspaceRenderItems={workspaceRenderItems}
        highlightedWorkspaceId={highlightedWorkspaceId}
        selectedWindowId={selectedWindowId}
        isSpotlightOpen={isSpotlightOpen}
        onCloseMissionControl={closeMissionControl}
        onHighlightWorkspace={highlightWorkspace}
        onCommitWorkspace={commitWorkspace}
        onSelectWindow={commitWindow}
        onCreateDesktop={createDesktop}
        onCloseSpace={closeFullscreenSpace}
        onPreviewSwitcherApp={previewSwitcherApp}
        onActivateSelectedApp={activateSelectedApp}
        onCloseSpotlight={() => setSpotlightOpen(false)}
        onOpenApp={openDesktopApp}
        onFocusWindow={focusWindow}
        onRunShortcut={(shortcutId, options) =>
          runSystemShortcut(shortcutId, {
            ignoreSurfaceState: options?.ignoreSurfaceState,
          })
        }
      />

      <NotificationShell
        isBooting={isBooting}
        activeToasts={activeToasts}
        notifications={notifications}
        unreadNotificationCount={unreadNotificationCount}
        appMap={appMap}
        isNotificationCenterOpen={isNotificationCenterOpen}
        onDismissToast={dismissToast}
        onOpenCenter={() => setNotificationCenterOpen(true)}
        onCloseCenter={() => setNotificationCenterOpen(false)}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onRemove={removeNotification}
        onClearAll={clearAllNotifications}
      />
    </div>
  );
}
