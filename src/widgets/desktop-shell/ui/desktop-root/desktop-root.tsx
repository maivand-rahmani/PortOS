"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useOSStore } from "@/processes";
import { SpotlightOverlay } from "@/features/spotlight-search";
import { useDesktopShell } from "../../model/use-desktop-shell";
import { useKeyboardShortcuts } from "../../model/use-keyboard-shortcuts";
import { useDefaultShortcuts } from "../../model/use-default-shortcuts";
import { BootOverlay } from "../boot-overlay";
import { DesktopIcons } from "../desktop-icons";
import { DesktopAiTeaser } from "../desktop-ai-teaser/desktop-ai-teaser";
import { DesktopWallpaper } from "../desktop-wallpaper";
import { MacDock } from "../mac-dock";
import { MacMenuBar } from "../mac-menu-bar";
import { NotificationCenterPanel } from "../notification-center-panel/notification-center-panel";
import { NotificationToasts } from "../notification-toasts/notification-toasts";
import { DockMenu } from "../dock-menu";
import { SnapGuideOverlay } from "../snap-guide-overlay/snap-guide-overlay";
import { WindowSurface } from "../window-surface";

export function DesktopShell() {
  const [isSpotlightOpen, setSpotlightOpen] = useState(false);
  const [isNotificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const toggleSpotlight = useCallback(() => {
    setSpotlightOpen((prev) => !prev);
  }, []);

  const toggleNotificationCenter = useCallback(() => {
    setNotificationCenterOpen((prev) => !prev);
  }, []);

  const {
    containerRef,
    apps,
    bootPhase,
    bootProgress,
    bootMessages,
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
    toggleWindowMaximize,
    beginWindowDrag,
    beginWindowResize,
    windowSnapZone,
    desktopBounds,
  } = useDesktopShell();

  const dockAutohide = useOSStore((state) => state.osSettings.dockAutohide);
  const appMap = useOSStore((state) => state.appMap);
  const notifications = useOSStore((state) => state.notifications);
  const activeToastIds = useOSStore((state) => state.activeToastIds);
  const pushNotification = useOSStore((state) => state.pushNotification);
  const dismissToast = useOSStore((state) => state.dismissToast);
  const removeNotification = useOSStore((state) => state.removeNotification);
  const markNotificationRead = useOSStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useOSStore((state) => state.markAllNotificationsRead);
  const clearAllNotifications = useOSStore((state) => state.clearAllNotifications);
  const registerShortcut = useOSStore((state) => state.registerShortcut);
  const unregisterShortcut = useOSStore((state) => state.unregisterShortcut);
  const shouldReduceMotion = useReducedMotion();
  const isBooting = bootPhase !== "ready";
  const unreadNotificationCount = notifications.filter((item) => !item.isRead).length;
  const hasReadyNotification = notifications.some(
    (item) => item.title === "PortOS is ready" && item.appId === undefined,
  );
  const activeToasts = activeToastIds
    .map((id) => notifications.find((item) => item.id === id) ?? null)
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // OS-level keyboard shortcut system
  useKeyboardShortcuts();
  useDefaultShortcuts();

  // Register Cmd+K spotlight shortcut
  useEffect(() => {
    if (isBooting) return;

    registerShortcut({
      id: "os:spotlight",
      label: "Spotlight Search",
      key: "k",
      modifiers: ["meta"],
      scope: "global",
      action: toggleSpotlight,
    });

    return () => unregisterShortcut("os:spotlight");
  }, [isBooting, registerShortcut, unregisterShortcut, toggleSpotlight]);

  useEffect(() => {
    if (bootPhase !== "ready" || hasReadyNotification) {
      return;
    }

    pushNotification({
      title: "PortOS is ready",
      body: "Spotlight search, app switching, and system tools are now available.",
      level: "success",
    });
  }, [bootPhase, hasReadyNotification, pushNotification]);

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
        clearDesktopSelection();
      }}
    >
      <DesktopWallpaper />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(10,132,255,0.18),transparent_30%)]" />

      <motion.div
        initial={shouldReduceMotion ? false : { y: -28, opacity: 0 }}
        animate={isBooting ? { y: -28, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: isBooting ? 0 : 0.1 }}
      >
        <MacMenuBar
          statusBar={statusBar}
          onRunAction={runStatusBarCommand}
          onOpenAgent={() => openDesktopApp("ai-agent")}
          notificationCount={unreadNotificationCount}
          onToggleNotifications={toggleNotificationCenter}
        />
      </motion.div>

      <main className="relative h-screen w-full">
        <DesktopAiTeaser
          isBooting={isBooting}
          position={aiWidgetPosition}
          onOpenAgent={() => openDesktopApp("ai-agent")}
          onRunPrompt={openAgentPrompt}
          onDragStart={beginAiWidgetDrag}
        />

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={isBooting ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: isBooting ? 0 : 0.2 }}
        >
          <DesktopIcons
            apps={apps}
            positions={desktopIconPositions}
            selectedAppId={selectedDesktopAppId}
            onSelectApp={selectDesktopApp}
            onOpenApp={openDesktopApp}
            onDragStart={beginDesktopIconDrag}
          />
        </motion.div>

        <div className="absolute inset-0 pointer-events-none">
          <SnapGuideOverlay zone={windowSnapZone} bounds={desktopBounds} />

          <AnimatePresence>
            {visibleWindows.map(
              ({ window, app, AppComponent, isActive, isDragging, isResizing }) => (
              <WindowSurface
                key={window.id}
                window={window}
                isActive={isActive}
                isDragging={isDragging}
                isResizing={isResizing}
                onFocus={() => focusWindow(window.id)}
                onClose={() => closeWindow(window.id)}
                onMinimize={() => minimizeWindow(window.id)}
                onToggleMaximize={() => toggleWindowMaximize(window.id)}
                onDragStart={(pointer) => beginWindowDrag(window.id, pointer)}
                onResizeStart={(direction, pointer) =>
                  beginWindowResize(window.id, direction, pointer)
                }
              >
                {AppComponent ? (
                  <AppComponent processId={window.processId} windowId={window.id} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    Loading {app.name}...
                  </div>
                )}
              </WindowSurface>
              ),
            )}
          </AnimatePresence>

          <AnimatePresence>
            {dockMenu ? <DockMenu menu={dockMenu} onAction={runDockMenuAction} /> : null}
          </AnimatePresence>
        </div>
      </main>

      <motion.div
        initial={shouldReduceMotion ? false : { y: 80, opacity: 0 }}
        animate={isBooting ? { y: 80, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: isBooting ? 0 : 0.15 }}
      >
        <MacDock
          dockApps={dockApps}
          minimizedWindows={minimizedWindows}
          apps={apps}
          autohide={dockAutohide}
          onActivateApp={openDesktopApp}
          onOpenMenu={openDockMenu}
          onRestoreWindow={restoreWindow}
        />
      </motion.div>

      <AnimatePresence>
        {isBooting ? (
          <BootOverlay
            phase={bootPhase}
            progress={bootProgress}
            messages={bootMessages}
          />
        ) : null}
      </AnimatePresence>

      <NotificationToasts
        toasts={activeToasts}
        appMap={appMap}
        onDismiss={dismissToast}
        onOpenCenter={() => setNotificationCenterOpen(true)}
      />

      <NotificationCenterPanel
        isOpen={isNotificationCenterOpen}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        appMap={appMap}
        onClose={() => setNotificationCenterOpen(false)}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onRemove={removeNotification}
        onClearAll={clearAllNotifications}
      />

      <SpotlightOverlay
        isOpen={isSpotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        onOpenApp={openDesktopApp}
        onFocusWindow={focusWindow}
      />
    </div>
  );
}
