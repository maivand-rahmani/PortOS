import type { AppConfig } from "@/entities/app";
import type { WindowPosition } from "@/entities/window";
import { cn } from "@/shared/lib";

type DesktopIconProps = {
  app: AppConfig;
  isSelected: boolean;
  position: WindowPosition;
  onSelect: () => void;
  onOpen: () => void;
  onDragStart: (pointer: WindowPosition) => void;
};

export function DesktopIcon({
  app,
  isSelected,
  position,
  onSelect,
  onOpen,
  onDragStart,
}: DesktopIconProps) {
  const Icon = app.icon;

  return (
    <button
      type="button"
      onDoubleClick={onOpen}
      onClick={onSelect}
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
      className={cn(
        "group absolute flex min-h-[5.5rem] w-[5.5rem] touch-none select-none flex-col items-center justify-center gap-2 rounded-3xl border px-3 py-3 text-center text-white/92 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
        isSelected ? "border-white/30 bg-white/16" : "border-transparent bg-white/5",
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/30 bg-white/18 shadow-[0_16px_30px_rgba(10,15,30,0.25)] backdrop-blur-xl">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="text-xs font-medium leading-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        {app.name}
      </span>
    </button>
  );
}
