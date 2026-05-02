"use client";

import { memo, useRef } from "react";
import type { FileSystemNode } from "@/entities/file-system";
import type { WindowPosition } from "@/entities/window";
import { cn } from "@/shared/lib";

const RENAME_CLICK_MIN = 300;
const RENAME_CLICK_MAX = 800;

type FsDesktopIconProps = {
  node: FileSystemNode;
  isSelected: boolean;
  isDropTarget: boolean;
  position: WindowPosition;
  compact?: boolean;
  onSelect: (event: React.MouseEvent) => void;
  onOpen: () => void;
  onDragStart: (pointer: WindowPosition) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  onRename?: () => void;
};

function FsDesktopIconComponent({
  node,
  isSelected,
  isDropTarget,
  position,
  compact = false,
  onSelect,
  onOpen,
  onDragStart,
  onContextMenu,
  onRename,
}: FsDesktopIconProps) {
  const isDir = node.type === "directory";
  const lastClickTimeRef = useRef(0);
  const wasSelectedRef = useRef(false);

  return (
    <button
      type="button"
      onDoubleClick={onOpen}
      onClick={(event) => {
        event.stopPropagation();

        const now = Date.now();
        const delta = now - lastClickTimeRef.current;

        if (wasSelectedRef.current && onRename && delta >= RENAME_CLICK_MIN && delta <= RENAME_CLICK_MAX) {
          lastClickTimeRef.current = 0;
          wasSelectedRef.current = false;
          onRename();
          return;
        }

        lastClickTimeRef.current = now;
        wasSelectedRef.current = isSelected;
        onSelect(event);
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.stopPropagation();
        onDragStart({
          x: event.clientX,
          y: event.clientY,
        });
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        if (!isSelected) {
          onSelect(event);
        }
        onContextMenu?.(event);
      }}
      className={cn(
        "group pointer-events-auto absolute flex touch-none select-none flex-col items-center justify-center text-center text-white/92 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
        compact
          ? "w-16 gap-1.5 rounded-2xl border px-2 py-1.5"
          : "min-h-[5.5rem] w-[5.5rem] gap-2 rounded-3xl border px-3 py-3",
        isSelected ? "border-white/30 bg-white/16" : "border-transparent bg-white/5",
        isDropTarget && "ring-2 ring-green-400/80",
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <span
        className={cn(
          "flex items-center justify-center border border-white/30 bg-white/18 shadow-[0_16px_30px_rgba(10,15,30,0.25)] backdrop-blur-xl",
          compact ? "h-10 w-10 rounded-[14px]" : "h-14 w-14 rounded-[20px]",
        )}
      >
        {isDir ? <FolderIcon compact={compact} /> : <FileIcon node={node} compact={compact} />}
      </span>
      <span
        className={cn(
          "truncate font-medium leading-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
          compact ? "max-w-14 text-[11px]" : "max-w-[5rem] text-xs",
        )}
      >
        {node.name}
      </span>
    </button>
  );
}

export const FsDesktopIcon = memo(FsDesktopIconComponent);

function FolderIcon({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? "h-5 w-5" : "h-7 w-7";

  return (
    <svg viewBox="0 0 24 24" fill="none" className={sizeClass}>
      <path
        d="M3 7.2C3 5.98 3.98 5 5.2 5h4.08c.46 0 .9.18 1.22.5l1.4 1.4c.1.1.24.16.38.16H18.8c1.22 0 2.2.98 2.2 2.2v7.38c0 1.22-.98 2.2-2.2 2.2H5.2C3.98 18.84 3 17.86 3 16.64V7.2z"
        fill="#fbbf24"
        fillOpacity="0.9"
      />
      <path
        d="M3 8.5c0-1.22.98-2.2 2.2-2.2h4.08c.46 0 .9.18 1.22.5l1.4 1.4c.1.1.24.16.38.16H18.8c1.22 0 2.2.98 2.2 2.2v1.3H3V8.5z"
        fill="#f59e0b"
        fillOpacity="0.7"
      />
    </svg>
  );
}

function FileIcon({ node, compact = false }: { node: FileSystemNode; compact?: boolean }) {
  const ext = node.type === "file" ? node.extension.toUpperCase() : "";
  const sizeClass = compact ? "h-5 w-5" : "h-7 w-7";

  return (
    <svg viewBox="0 0 24 24" fill="none" className={sizeClass}>
      <path
        d="M5 4.5C5 3.67 5.67 3 6.5 3H14l5 5v11.5c0 .83-.67 1.5-1.5 1.5h-11c-.83 0-1.5-.67-1.5-1.5v-15z"
        fill="white"
        fillOpacity="0.25"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />
      <path d="M14 3v4c0 .55.45 1 1 1h4" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
      {ext ? (
        <text
          x="12"
          y="15"
          textAnchor="middle"
          fill="white"
          fillOpacity="0.7"
          fontSize="5"
          fontWeight="600"
        >
          {ext}
        </text>
      ) : null}
    </svg>
  );
}
