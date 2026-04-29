"use client";

import { motion } from "framer-motion";

import type { AppConfig } from "@/entities/app";
import type { WindowInstance, WindowPosition } from "@/entities/window";
import type { DockAppState } from "../../model/desktop-shell.types";
import { MacDock } from "../mac-dock";

type DockShellProps = {
  isBooting: boolean;
  showDock: boolean;
  dockApps: DockAppState[];
  minimizedWindows: WindowInstance[];
  apps: AppConfig[];
  dockAutohide: boolean;
  isFullscreenWorkspace: boolean;
  shouldReduceMotion: boolean;
  onActivateApp: (appId: string) => void;
  onOpenMenu: (appId: string, anchor: WindowPosition) => void;
  onRestoreWindow: (windowId: string) => void;
};

export function DockShell({
  isBooting,
  showDock,
  dockApps,
  minimizedWindows,
  apps,
  dockAutohide,
  isFullscreenWorkspace,
  shouldReduceMotion,
  onActivateApp,
  onOpenMenu,
  onRestoreWindow,
}: DockShellProps) {
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { y: 80, opacity: 0 }}
      animate={
        isBooting
          ? { y: 80, opacity: 0 }
          : showDock
            ? { y: 0, opacity: 1 }
            : { y: 120, opacity: 0 }
      }
      transition={{ duration: 0.5, ease: "easeOut", delay: isBooting ? 0 : 0.15 }}
    >
      <MacDock
        dockApps={dockApps}
        minimizedWindows={minimizedWindows}
        apps={apps}
        autohide={!isFullscreenWorkspace && dockAutohide}
        isFullscreen={isFullscreenWorkspace}
        onActivateApp={onActivateApp}
        onOpenMenu={onOpenMenu}
        onRestoreWindow={onRestoreWindow}
      />
    </motion.div>
  );
}
