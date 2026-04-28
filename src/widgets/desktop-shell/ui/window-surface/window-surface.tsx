import { ChevronDown, Maximize2, Minus, SplitSquareVertical, X } from "lucide-react";
import { motion } from "framer-motion";

import type { WindowInstance, WindowPosition } from "@/entities/window";
import type { WindowResizeDirection } from "@/processes";
import { cn } from "@/shared/lib";

import { WINDOW_SURFACE_TRANSITION } from "../../model/desktop-shell.constants";
import { WindowTrafficButton } from "../window-traffic-button";

type WindowSurfaceProps = {
  window: WindowInstance;
  isActive: boolean;
  isDragging: boolean;
  isResizing: boolean;
  children: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onEnterSplitView?: (side: "left" | "right") => void;
  onHeaderDoubleClick?: () => void;
  onDragStart: (pointer: WindowPosition) => void;
  onResizeStart: (direction: WindowResizeDirection, pointer: WindowPosition) => void;
};

const WINDOW_RESIZE_HANDLES: Array<{
  direction: WindowResizeDirection;
  className: string;
}> = [
  { direction: "n", className: "absolute inset-x-4 top-0 h-2 cursor-ns-resize" },
  { direction: "s", className: "absolute inset-x-4 bottom-0 h-2 cursor-ns-resize" },
  { direction: "e", className: "absolute inset-y-4 right-0 w-2 cursor-ew-resize" },
  { direction: "w", className: "absolute inset-y-4 left-0 w-2 cursor-ew-resize" },
  { direction: "ne", className: "absolute right-0 top-0 h-4 w-4 cursor-nesw-resize" },
  { direction: "nw", className: "absolute left-0 top-0 h-4 w-4 cursor-nwse-resize" },
  { direction: "se", className: "absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize" },
  { direction: "sw", className: "absolute bottom-0 left-0 h-4 w-4 cursor-nesw-resize" },
];

export function WindowSurface({
  window,
  isActive,
  isDragging,
  isResizing,
  children,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onEnterSplitView,
  onHeaderDoubleClick,
  onDragStart,
  onResizeStart,
}: WindowSurfaceProps) {
  const isFullscreen = window.isFullscreen;

  return (
    <motion.article
      layout={!window.isMaximized && !window.isFullscreen && !isDragging}
      initial={{ opacity: 0, scale: 0.98, y: 18 }}
      animate={{ opacity: 1, scale: isDragging || isResizing ? 1.01 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 22 }}
      transition={WINDOW_SURFACE_TRANSITION}
      className={cn(
        "pointer-events-auto absolute overflow-hidden bg-window",
        isFullscreen
          ? "border-0 rounded-none shadow-none backdrop-blur-none"
          : "rounded-[30px] border border-white/45 shadow-[0_36px_90px_rgba(6,12,24,0.34)] backdrop-blur-2xl",
        isActive && !isFullscreen ? "ring-1 ring-white/40" : "opacity-[0.985] saturate-[0.92]",
      )}
      style={{
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
        transform: `translate3d(${window.position.x}px, ${window.position.y}px, 0)`,
        willChange: "transform",
      }}
      onMouseDown={onFocus}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    >
      {!window.isMaximized && !window.isFullscreen
        ? WINDOW_RESIZE_HANDLES.map((handle) => (
            <div
              key={handle.direction}
              aria-hidden="true"
              data-resize-direction={handle.direction}
              className={cn("absolute z-20 touch-none bg-transparent", handle.className)}
              onPointerDown={(event) => {
                if (event.button !== 0) {
                  return;
                }

                event.stopPropagation();
                onResizeStart(handle.direction, {
                  x: event.clientX,
                  y: event.clientY,
                });
              }}
            />
          ))
        : null}

      {!isFullscreen ? (
        <header
          className={cn(
            "flex h-14 touch-none select-none cursor-grab items-center justify-between border-b border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,246,251,0.74))] px-4 active:cursor-grabbing",
            (isDragging || isResizing) && "cursor-grabbing",
          )}
          onDoubleClick={(event) => {
            event.stopPropagation();
            onHeaderDoubleClick?.();
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) {
              return;
            }

            onDragStart({
              x: event.clientX,
              y: event.clientY,
            });
          }}
        >
          <div className="group flex items-center gap-2">
            <WindowTrafficButton
              tone="red"
              icon={<X className="h-2.5 w-2.5 hidden group-hover:block" aria-hidden="true" />}
              label={`Close ${window.title}`}
              onClick={onClose}
            />
            <WindowTrafficButton
              tone="yellow"
              icon={<Minus className="h-2.5 w-2.5 hidden group-hover:block" aria-hidden="true" />}
              label={`Minimize ${window.title}`}
              onClick={onMinimize}
            />
            <WindowTrafficButton
              tone="green"
              icon={<Maximize2 className="h-2.5 w-2.5 hidden group-hover:block" aria-hidden="true" />}
              label={`Toggle fullscreen ${window.title}`}
              onClick={onToggleMaximize}
            />
          </div>

          <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground/88">
            <span>{window.title}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          </div>

          <div className="w-[4.5rem]" />
        </header>
      ) : (
        <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between bg-[linear-gradient(180deg,rgba(14,18,24,0.68),rgba(14,18,24,0.08))] px-4 text-white/90">
          <div className="group flex items-center gap-2">
            <WindowTrafficButton
              tone="red"
              icon={<X className="h-2.5 w-2.5 hidden group-hover:block" aria-hidden="true" />}
              label={`Close ${window.title}`}
              onClick={onClose}
            />
            <WindowTrafficButton
              tone="yellow"
              icon={<Minus className="h-2.5 w-2.5 hidden group-hover:block" aria-hidden="true" />}
              label={`Minimize ${window.title}`}
              onClick={onMinimize}
            />
            <WindowTrafficButton
              tone="green"
              icon={<Maximize2 className="h-2.5 w-2.5 hidden group-hover:block" aria-hidden="true" />}
              label={`Exit fullscreen ${window.title}`}
              onClick={onToggleMaximize}
            />
          </div>

          <div className="flex items-center gap-3">
            {onEnterSplitView ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEnterSplitView("left")}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-white/12 bg-white/10 px-3 text-[11px] font-medium text-white/84 transition-colors hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <SplitSquareVertical className="h-3.5 w-3.5" aria-hidden="true" />
                  Tile Left
                </button>
                <button
                  type="button"
                  onClick={() => onEnterSplitView("right")}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-white/12 bg-white/10 px-3 text-[11px] font-medium text-white/84 transition-colors hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <SplitSquareVertical className="h-3.5 w-3.5" aria-hidden="true" />
                  Tile Right
                </button>
              </div>
            ) : null}
            <span className="text-sm font-semibold tracking-tight text-white/82">{window.title}</span>
          </div>

          <div className="w-[4.5rem]" />
        </div>
      )}

      <div
        className={cn(
          "overflow-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,247,252,0.92))]",
          isFullscreen ? "h-full p-0 pt-14" : "h-[calc(100%-3.5rem)] p-4 sm:p-5",
        )}
      >
        {children}
      </div>
    </motion.article>
  );
}
