"use client";

import { motion } from "framer-motion";

import type { StatusBarModel } from "../../model/status-bar";
import { MacMenuBar } from "../mac-menu-bar";

type MenuBarShellProps = {
  isBooting: boolean;
  showMenuBar: boolean;
  isFullscreenWorkspace: boolean;
  statusBar: StatusBarModel;
  unreadNotificationCount: number;
  shouldReduceMotion: boolean;
  onRunStatusBarCommand: (actionId: string) => void;
  onOpenDesktopApp: (appId: string) => void;
  onOpenAiPaletteFromActiveContext: () => void;
  onOpenAppSwitcher: () => void;
  onToggleNotifications: () => void;
};

export function MenuBarShell({
  isBooting,
  showMenuBar,
  isFullscreenWorkspace,
  statusBar,
  unreadNotificationCount,
  shouldReduceMotion,
  onRunStatusBarCommand,
  onOpenDesktopApp,
  onOpenAiPaletteFromActiveContext,
  onOpenAppSwitcher,
  onToggleNotifications,
}: MenuBarShellProps) {
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { y: -28, opacity: 0 }}
      animate={
        isBooting
          ? { y: -28, opacity: 0 }
          : showMenuBar
            ? { y: 0, opacity: 1 }
            : { y: -36, opacity: 0 }
      }
      transition={{ duration: 0.5, ease: "easeOut", delay: isBooting ? 0 : 0.1 }}
    >
      <MacMenuBar
        statusBar={statusBar}
        isFullscreen={isFullscreenWorkspace}
        onRunAction={onRunStatusBarCommand}
        onOpenAgent={() => onOpenDesktopApp("ai-agent")}
        onOpenAiPalette={() => {
          void onOpenAiPaletteFromActiveContext();
        }}
        onOpenAppSwitcher={onOpenAppSwitcher}
        notificationCount={unreadNotificationCount}
        onToggleNotifications={onToggleNotifications}
      />
    </motion.div>
  );
}
