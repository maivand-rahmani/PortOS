"use client";

import { motion, AnimatePresence } from "framer-motion";

import { useOSStore } from "@/processes";
import type { WindowPosition } from "@/entities/window";
import type { DesktopItem } from "../../model/desktop-context-menu/desktop-context-menu.types";
import { DesktopAiTeaser } from "../desktop-ai-teaser/desktop-ai-teaser";
import { DesktopIcons } from "../desktop-icons";

type DesktopIconsShellProps = {
  showDesktopChrome: boolean;
  isBooting: boolean;
  items: DesktopItem[];
  selectedItemIds: string[];
  dropTargetFolderId: string | null;
  aiWidgetPosition: WindowPosition | null;
  shouldReduceMotion: boolean;
  onSelectItem: (itemId: string, event: React.MouseEvent) => void;
  onOpenItem: (itemId: string) => void;
  onOpenAgentPrompt: (prompt: string) => void;
  onBeginAiWidgetDrag: (pointer: WindowPosition) => void;
  onBeginDesktopIconDrag: (itemId: string, pointer: WindowPosition) => void;
  onContextMenuItem?: (itemId: string, event: React.MouseEvent) => void;
  onRenameItem?: (itemId: string) => void;
};

export function DesktopIconsShell({
  showDesktopChrome,
  isBooting,
  items,
  selectedItemIds,
  dropTargetFolderId,
  aiWidgetPosition,
  shouldReduceMotion,
  onSelectItem,
  onOpenItem,
  onOpenAgentPrompt,
  onBeginAiWidgetDrag,
  onBeginDesktopIconDrag,
  onContextMenuItem,
  onRenameItem,
}: DesktopIconsShellProps) {
  const desktopViewMode = useOSStore((s) => s.desktopViewMode);
  const compact = desktopViewMode === "compact";

  return (
    <>
      {showDesktopChrome ? (
        <DesktopAiTeaser
          isBooting={isBooting}
          position={aiWidgetPosition}
          onOpenAgent={() => onOpenItem("app:ai-agent")}
          onRunPrompt={onOpenAgentPrompt}
          onDragStart={onBeginAiWidgetDrag}
        />
      ) : null}

      {showDesktopChrome ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`desktop-icons-${desktopViewMode}`}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={isBooting ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: isBooting ? 0 : 0.2 }}
          >
            <DesktopIcons
              items={items}
              selectedItemIds={selectedItemIds}
              dropTargetFolderId={dropTargetFolderId}
              compact={compact}
              onSelectItem={onSelectItem}
              onOpenItem={onOpenItem}
              onDragStart={onBeginDesktopIconDrag}
              onContextMenuItem={onContextMenuItem}
              onRenameItem={onRenameItem}
            />
          </motion.div>
        </AnimatePresence>
      ) : null}
    </>
  );
}
