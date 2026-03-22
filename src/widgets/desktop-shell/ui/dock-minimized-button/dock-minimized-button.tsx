import { Activity } from "lucide-react";

import type { AppConfig } from "@/entities/app";
import type { WindowInstance } from "@/entities/window";

type DockMinimizedButtonProps = {
  window: WindowInstance;
  app?: AppConfig;
  onRestore: () => void;
};

export function DockMinimizedButton({ window, app, onRestore }: DockMinimizedButtonProps) {
  const AppIcon = app?.icon ?? Activity;

  return (
    <button
      type="button"
      onClick={onRestore}
      className="group relative flex flex-col items-center gap-2 rounded-2xl px-1 pb-1 pt-0 text-white transition duration-200 hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span className="pointer-events-none absolute -top-10 rounded-xl bg-black/65 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
        Restore {window.title}
      </span>
      <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/28 bg-white/16 shadow-[0_12px_24px_rgba(12,18,30,0.26)] backdrop-blur-xl">
        <AppIcon className="h-6 w-6" aria-hidden="true" />
      </span>
    </button>
  );
}
