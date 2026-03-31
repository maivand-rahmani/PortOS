"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useOSStore } from "@/processes";
import { useDesktopShell } from "../../model/use-desktop-shell";
import { BootOverlay } from "../boot-overlay";
import { DesktopIcons } from "../desktop-icons";
import { DesktopAiTeaser } from "../desktop-ai-teaser/desktop-ai-teaser";
import { DesktopWallpaper } from "../desktop-wallpaper";
import { MacDock } from "../mac-dock";
import { MacMenuBar } from "../mac-menu-bar";
import { DockMenu } from "../dock-menu";
import { WindowSurface } from "../window-surface";

export function DesktopShell() {
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
  } = useDesktopShell();

  const dockAutohide = useOSStore((state) => state.osSettings.dockAutohide);
  const shouldReduceMotion = useReducedMotion();
  const isBooting = bootPhase !== "ready";

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
    </div>
  );
}
