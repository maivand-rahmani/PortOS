"use client";

import { AnimatePresence } from "framer-motion";

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
    processCount,
    bootPhase,
    bootProgress,
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
    toggleWindowMaximize,
    beginWindowDrag,
    beginWindowResize,
  } = useDesktopShell();

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

      <MacMenuBar processCount={processCount} />

      <main className="relative h-screen w-full">
        <DesktopAiTeaser
          isBooting={bootPhase === "booting"}
          position={aiWidgetPosition}
          onOpenAgent={() => openDesktopApp("ai-agent")}
          onRunPrompt={openAgentPrompt}
          onDragStart={beginAiWidgetDrag}
        />

        <DesktopIcons
          apps={apps}
          positions={desktopIconPositions}
          selectedAppId={selectedDesktopAppId}
          onSelectApp={selectDesktopApp}
          onOpenApp={openDesktopApp}
          onDragStart={beginDesktopIconDrag}
        />

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

      <MacDock
        dockApps={dockApps}
        minimizedWindows={minimizedWindows}
        apps={apps}
        onActivateApp={openDesktopApp}
        onOpenMenu={openDockMenu}
        onRestoreWindow={restoreWindow}
      />

      <AnimatePresence>
        {bootPhase === "booting" ? <BootOverlay progress={bootProgress} /> : null}
      </AnimatePresence>
    </div>
  );
}
