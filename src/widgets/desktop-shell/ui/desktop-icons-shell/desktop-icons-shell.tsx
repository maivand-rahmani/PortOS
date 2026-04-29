"use client";

import { motion } from "framer-motion";

import type { AppConfig } from "@/entities/app";
import type { WindowPosition } from "@/entities/window";
import type { DesktopIconMap } from "../../model/desktop-shell.types";
import { DesktopAiTeaser } from "../desktop-ai-teaser/desktop-ai-teaser";
import { DesktopIcons } from "../desktop-icons";

type DesktopIconsShellProps = {
  showDesktopChrome: boolean;
  isBooting: boolean;
  apps: AppConfig[];
  desktopIconPositions: DesktopIconMap;
  selectedDesktopAppId: string | null;
  aiWidgetPosition: WindowPosition | null;
  shouldReduceMotion: boolean;
  onSelectApp: (appId: string | null) => void;
  onOpenApp: (appId: string) => void;
  onOpenAgentPrompt: (prompt: string) => void;
  onBeginAiWidgetDrag: (pointer: WindowPosition) => void;
  onBeginDesktopIconDrag: (appId: string, pointer: WindowPosition) => void;
};

export function DesktopIconsShell({
  showDesktopChrome,
  isBooting,
  apps,
  desktopIconPositions,
  selectedDesktopAppId,
  aiWidgetPosition,
  shouldReduceMotion,
  onSelectApp,
  onOpenApp,
  onOpenAgentPrompt,
  onBeginAiWidgetDrag,
  onBeginDesktopIconDrag,
}: DesktopIconsShellProps) {
  return (
    <>
      {showDesktopChrome ? (
        <DesktopAiTeaser
          isBooting={isBooting}
          position={aiWidgetPosition}
          onOpenAgent={() => onOpenApp("ai-agent")}
          onRunPrompt={onOpenAgentPrompt}
          onDragStart={onBeginAiWidgetDrag}
        />
      ) : null}

      {showDesktopChrome ? (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={isBooting ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: isBooting ? 0 : 0.2 }}
        >
          <DesktopIcons
            apps={apps}
            positions={desktopIconPositions}
            selectedAppId={selectedDesktopAppId}
            onSelectApp={onSelectApp}
            onOpenApp={onOpenApp}
            onDragStart={onBeginDesktopIconDrag}
          />
        </motion.div>
      ) : null}
    </>
  );
}
