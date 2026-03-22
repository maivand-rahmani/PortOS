import type { AppConfig } from "@/entities/app";
import type { WindowPosition } from "@/entities/window";

import type { DesktopIconMap } from "../../model/desktop-shell.types";
import { DesktopIcon } from "../desktop-icon";

type DesktopIconsProps = {
  apps: AppConfig[];
  selectedAppId: string | null;
  positions: DesktopIconMap;
  onSelectApp: (appId: string | null) => void;
  onOpenApp: (appId: string) => void;
  onDragStart: (appId: string, pointer: WindowPosition) => void;
};

export function DesktopIcons({
  apps,
  selectedAppId,
  positions,
  onSelectApp,
  onOpenApp,
  onDragStart,
}: DesktopIconsProps) {
  return (
    <div className="absolute inset-0 z-10">
      {apps.map((app) => {
        const position = positions[app.id];

        if (!position) {
          return null;
        }

        return (
          <DesktopIcon
            key={app.id}
            app={app}
            isSelected={selectedAppId === app.id}
            position={position}
            onSelect={() => onSelectApp(app.id)}
            onOpen={() => onOpenApp(app.id)}
            onDragStart={(pointer) => onDragStart(app.id, pointer)}
          />
        );
      })}
    </div>
  );
}
