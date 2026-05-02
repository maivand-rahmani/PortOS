import { memo } from "react";
import type { AppConfig } from "@/entities/app";
import type { WindowPosition } from "@/entities/window";
import { cn } from "@/shared/lib";

type DesktopIconProps = {
  app: AppConfig;
  isSelected: boolean;
  position: WindowPosition;
  compact?: boolean;
  onSelect: (event: React.MouseEvent) => void;
  onOpen: () => void;
  onDragStart: (pointer: WindowPosition) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
};

function DesktopIconComponent({
  app,
  isSelected,
  position,
  compact = false,
  onSelect,
  onOpen,
  onDragStart,
  onContextMenu,
}: DesktopIconProps) {
  const Icon = app.icon;

  return (
    <button
      type="button"
      onDoubleClick={onOpen}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(event);
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }

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
        <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} aria-hidden="true" />
      </span>
      <span
        className={cn(
          "font-medium leading-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        {app.name}
      </span>
    </button>
  );
}

export const DesktopIcon = memo(DesktopIconComponent);
