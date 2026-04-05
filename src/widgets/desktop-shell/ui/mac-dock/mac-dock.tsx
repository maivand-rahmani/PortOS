import { cn } from "@/shared/lib";
import type { AppConfig } from "@/entities/app";
import type { WindowInstance, WindowPosition } from "@/entities/window";

import type { DockAppState } from "../../model/desktop-shell.types";
import { DockAppButton } from "../dock-app-button";
import { DockMinimizedButton } from "../dock-minimized-button";

type MacDockProps = {
  dockApps: DockAppState[];
  minimizedWindows: WindowInstance[];
  apps: AppConfig[];
  autohide?: boolean;
  isFullscreen?: boolean;
  onActivateApp: (appId: string) => void;
  onOpenMenu: (appId: string, anchor: WindowPosition) => void;
  onRestoreWindow: (windowId: string) => void;
};

export function MacDock({
  dockApps,
  minimizedWindows,
  apps,
  autohide = false,
  isFullscreen = false,
  onActivateApp,
  onOpenMenu,
  onRestoreWindow,
}: MacDockProps) {
  const appMap = new Map(apps.map((app) => [app.id, app]));

  return (
    <footer
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-4 z-[500] flex justify-center px-4 transition-all duration-300",
        autohide && "translate-y-[calc(100%+1rem)] hover:translate-y-0",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-end gap-3 rounded-[28px] border border-white/26 px-4 py-3 shadow-[0_30px_60px_rgba(8,14,26,0.24)] backdrop-blur-2xl",
          isFullscreen ? "bg-[rgba(16,20,29,0.58)]" : "bg-white/18",
        )}
      >
        {dockApps.map((item) => (
          <DockAppButton
            key={item.app.id}
            item={item}
            onActivate={() => onActivateApp(item.app.id)}
            onOpenMenu={(anchor) => onOpenMenu(item.app.id, anchor)}
          />
        ))}

        {minimizedWindows.length > 0 ? <div className="mx-1 h-12 w-px bg-white/25" /> : null}

        {minimizedWindows.map((window) => (
          <DockMinimizedButton
            key={window.id}
            window={window}
            app={appMap.get(window.appId)}
            onRestore={() => onRestoreWindow(window.id)}
          />
        ))}
      </div>
    </footer>
  );
}
