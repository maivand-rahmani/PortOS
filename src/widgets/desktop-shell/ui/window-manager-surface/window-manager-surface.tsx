"use client";

import { AnimatePresence, motion } from "framer-motion";

import { WindowSurface } from "../window-surface";
import { WindowErrorBoundary } from "@/shared/ui/window-error-boundary";
import { SplitViewDivider } from "../split-view-divider/split-view-divider";
import { SplitViewPicker } from "../split-view-picker/split-view-picker";
import { SnapGuideOverlay } from "../snap-guide-overlay/snap-guide-overlay";
import { FileDropOverlay } from "../file-drop-overlay/file-drop-overlay";
import { DockMenu } from "../dock-menu";
import { WORKSPACE_TRACK_TRANSITION } from "../../model/desktop-shell.constants";
import type {
  WorkspaceRenderItem,
  WindowRenderItem,
  DockMenuModel,
  DockMenuAction,
  SplitViewPickerState,
} from "../../model/desktop-shell.types";
import type { AppConfig } from "@/entities/app";
import type { DesktopBounds, WindowPosition } from "@/entities/window";
import type { WorkspaceSplitView } from "@/entities/workspace";
import type { WindowResizeDirection, FileDropTarget } from "@/processes";
import type { WindowSnapZone } from "@/processes/os/model/window-manager/window-manager.snap";

type WindowManagerSurfaceProps = {
  workspaceRenderItems: WorkspaceRenderItem[];
  visibleWindows: WindowRenderItem[];
  currentWorkspaceId: string;
  currentWorkspaceIndex: number;
  trackAnimate: { x: string };
  splitDividerZIndex: number;
  splitPickerZIndex: number;
  currentSplitView: WorkspaceSplitView | null;
  splitViewPicker: SplitViewPickerState | null;
  splitViewCandidates: AppConfig[];
  windowSnapZone: WindowSnapZone | null;
  desktopBounds: DesktopBounds | null;
  fileDragNodeId: string | null;
  fileDropTarget: FileDropTarget | null;
  dockMenu: DockMenuModel | null;
  shouldReduceMotion: boolean | null;
  onFocusWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
  onToggleWindowFullscreen: (id: string) => void;
  onToggleWindowMaximize: (id: string) => void;
  onOpenSplitViewPicker: (windowId: string, side: "left" | "right") => void;
  onBeginWindowDrag: (windowId: string, pointer: WindowPosition) => void;
  onBeginWindowResize: (
    windowId: string,
    direction: WindowResizeDirection,
    pointer: WindowPosition,
  ) => void;
  onBeginSplitViewResize: (workspaceId: string, pointerX: number) => void;
  onChooseSplitViewApp: (appId: string) => void;
  onCloseSplitViewPicker: () => void;
  onSetFileDropTarget: (target: FileDropTarget | null) => void;
  onRunDockMenuAction: (action: DockMenuAction) => void;
  onCloseDockMenu: () => void;
};

export function WindowManagerSurface({
  workspaceRenderItems,
  visibleWindows,
  currentWorkspaceId,
  currentWorkspaceIndex,
  trackAnimate,
  splitDividerZIndex,
  splitPickerZIndex,
  currentSplitView,
  splitViewPicker,
  splitViewCandidates,
  windowSnapZone,
  desktopBounds,
  fileDragNodeId,
  fileDropTarget,
  dockMenu,
  shouldReduceMotion,
  onFocusWindow,
  onCloseWindow,
  onMinimizeWindow,
  onToggleWindowFullscreen,
  onToggleWindowMaximize,
  onOpenSplitViewPicker,
  onBeginWindowDrag,
  onBeginWindowResize,
  onBeginSplitViewResize,
  onChooseSplitViewApp,
  onCloseSplitViewPicker,
  onSetFileDropTarget,
  onRunDockMenuAction,
  onCloseDockMenu,
}: WindowManagerSurfaceProps) {
  return (
    <>
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
                      onFocus={() => onFocusWindow(window.id)}
                      onClose={() => onCloseWindow(window.id)}
                      onMinimize={() => onMinimizeWindow(window.id)}
                      onToggleMaximize={() => onToggleWindowFullscreen(window.id)}
                      onEnterSplitView={
                        workspace.id === currentWorkspaceId && workspace.kind === "fullscreen"
                          ? (side) => onOpenSplitViewPicker(window.id, side)
                          : undefined
                      }
                      onHeaderDoubleClick={() => onToggleWindowMaximize(window.id)}
                      onDragStart={(pointer) => onBeginWindowDrag(window.id, pointer)}
                      onResizeStart={(direction, pointer) =>
                        onBeginWindowResize(window.id, direction, pointer)
                      }
                    >
                      {AppComponent ? (
                        <WindowErrorBoundary
                          appName={app.name}
                          windowTitle={window.title}
                          onClose={() => onCloseWindow(window.id)}
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
                    onPointerDown={(pointerX) =>
                      onBeginSplitViewResize(workspace.id, pointerX)
                    }
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
                      onChooseApp={onChooseSplitViewApp}
                      onCancel={onCloseSplitViewPicker}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <SnapGuideOverlay zone={windowSnapZone} bounds={desktopBounds} />
        <FileDropOverlay
          fileDragNodeId={fileDragNodeId}
          fileDropTarget={fileDropTarget}
          windows={visibleWindows}
        />

        <AnimatePresence>
          {dockMenu ? <DockMenu menu={dockMenu} onAction={onRunDockMenuAction} /> : null}
        </AnimatePresence>
      </div>
    </>
  );
}
