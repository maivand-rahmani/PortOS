"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ContextMenuState,
  ContextMenuItem,
  SortConfig,
} from "../../model/desktop-context-menu/desktop-context-menu.types";
import { DesktopContextMenuItem } from "./desktop-context-menu-item";
import { DesktopContextMenuSeparator } from "./desktop-context-menu-separator";

type ViewMode = "grid" | "compact";

type DesktopContextMenuProps = {
  state: ContextMenuState;
  onAction: (actionId: string) => void;
  onClose: () => void;
  currentSort: SortConfig;
  currentViewMode: ViewMode;
};

export function DesktopContextMenu({
  state,
  onAction,
  onClose: _onClose,
  currentSort: _currentSort,
  currentViewMode: _currentViewMode,
}: DesktopContextMenuProps) {
  const adjustedPosition = useMemo(() => {
    const menuWidth = 260;
    const padding = 8;
    const estimatedItemHeight = 36;
    const menuPadding = 16;
    const separatorCount = state.items.filter(
      (i) => i.kind === "separator",
    ).length;
    const itemCount = state.items.length - separatorCount;
    const estimatedHeight =
      itemCount * estimatedItemHeight +
      separatorCount * 2 +
      menuPadding;

    if (typeof window === "undefined") return state.position;

    let x = state.position.x;
    let y = state.position.y;

    if (x + menuWidth + padding > window.innerWidth) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (y + estimatedHeight + padding > window.innerHeight) {
      y = window.innerHeight - estimatedHeight - padding;
    }
    if (x < padding) x = padding;
    if (y < padding) y = padding;

    return { x, y };
  }, [state.position, state.items]);

  return (
    <AnimatePresence>
      {state.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="pointer-events-auto absolute z-[600] w-[260px] rounded-[24px] border border-white/35 bg-[linear-gradient(180deg,rgba(36,43,57,0.82),rgba(19,24,34,0.88))] p-2 text-white shadow-[0_24px_80px_rgba(3,8,18,0.42)] backdrop-blur-2xl"
          style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        >
          <div className="space-y-1">
            {state.items.map((item) => renderMenuItem(item, onAction))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function renderMenuItem(
  item: ContextMenuItem,
  onAction: (actionId: string) => void,
) {
  if (item.kind === "separator") {
    return <DesktopContextMenuSeparator key={item.key} />;
  }
  return (
    <DesktopContextMenuItem key={item.id} item={item} onAction={onAction} />
  );
}
