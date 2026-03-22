import { ChevronDown, Maximize2, Minus, X } from "lucide-react";
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
  onDragStart,
  onResizeStart,
}: WindowSurfaceProps) {
  return (
    <motion.article
      layout={!window.isMaximized && !isDragging}
      initial={{ opacity: 0, scale: 0.98, y: 18 }}
      animate={{ opacity: 1, scale: isDragging || isResizing ? 1.01 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 22 }}
      transition={WINDOW_SURFACE_TRANSITION}
      className={cn(
        "pointer-events-auto absolute overflow-hidden rounded-[30px] border border-white/45 bg-window shadow-[0_36px_90px_rgba(6,12,24,0.34)] backdrop-blur-2xl",
        isActive ? "ring-1 ring-white/40" : "opacity-[0.985] saturate-[0.92]",
      )}
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={onFocus}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    >
      {!window.isMaximized
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

      <header
        className={cn(
          "flex h-14 touch-none select-none cursor-grab items-center justify-between border-b border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,246,251,0.74))] px-4 active:cursor-grabbing",
          (isDragging || isResizing) && "cursor-grabbing",
        )}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onToggleMaximize();
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
            label={`Toggle maximize ${window.title}`}
            onClick={onToggleMaximize}
          />
        </div>

        <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground/88">
          <span>{window.title}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        </div>

        <div className="w-[4.5rem]" />
      </header>

      <div className="h-[calc(100%-3.5rem)] overflow-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,247,252,0.92))] p-4 sm:p-5">
        {children}
      </div>
    </motion.article>
  );
}
