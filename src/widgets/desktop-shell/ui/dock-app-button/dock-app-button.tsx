import type { DockAppState } from "../../model/desktop-shell.types";
import { cn } from "@/shared/lib";

type DockAppButtonProps = {
  item: DockAppState;
  onActivate: () => void;
};

export function DockAppButton({ item, onActivate }: DockAppButtonProps) {
  const Icon = item.app.icon;
  const label =
    item.openCount > 0
      ? `${item.app.name} - ${item.openCount} open`
      : `${item.app.name} - closed`;

  return (
    <button
      type="button"
      onClick={onActivate}
      className="group relative flex flex-col items-center gap-2 rounded-2xl px-1 pb-1 pt-0 text-white transition duration-200 hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      aria-label={label}
    >
      <span className="pointer-events-none absolute -top-10 rounded-xl bg-black/65 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
        {item.app.name}
      </span>
      <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/28 bg-white/22 shadow-[0_12px_24px_rgba(12,18,30,0.26)] backdrop-blur-xl">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="flex items-center gap-1">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-white/90 transition-opacity",
            item.visibleCount > 0 ? "opacity-100" : "opacity-0",
          )}
        />
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-white/60 transition-opacity",
            item.minimizedCount > 0 ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      <span className="sr-only">
        {item.openCount} open, {item.visibleCount} visible, {item.minimizedCount} minimized
      </span>
    </button>
  );
}
