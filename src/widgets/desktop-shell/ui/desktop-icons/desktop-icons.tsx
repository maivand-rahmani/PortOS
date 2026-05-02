"use client";

import { memo } from "react";
import type { WindowPosition } from "@/entities/window";
import type { DesktopItem } from "../../model/desktop-context-menu/desktop-context-menu.types";
import { DesktopIcon } from "../desktop-icon";
import { FsDesktopIcon } from "./fs-desktop-icon";

type DesktopIconsProps = {
  items: DesktopItem[];
  selectedItemIds: string[];
  dropTargetFolderId: string | null;
  compact: boolean;
  onSelectItem: (itemId: string, event: React.MouseEvent) => void;
  onOpenItem: (itemId: string) => void;
  onDragStart: (itemId: string, pointer: WindowPosition) => void;
  onContextMenuItem?: (itemId: string, event: React.MouseEvent) => void;
  onRenameItem?: (itemId: string) => void;
};

function DesktopIconsComponent({
  items,
  selectedItemIds,
  dropTargetFolderId,
  compact,
  onSelectItem,
  onOpenItem,
  onDragStart,
  onContextMenuItem,
  onRenameItem,
}: DesktopIconsProps) {
  return (
    <div className="absolute inset-0 z-10">
      {items.map((item) => {
        const itemId = item.kind === "app" ? `app:${item.app.id}` : `fs:${item.node.id}`;

        if (item.kind === "app") {
          return (
            <DesktopIcon
              key={itemId}
              app={item.app}
              isSelected={selectedItemIds.includes(itemId)}
              position={item.position}
              compact={compact}
              onSelect={(event) => onSelectItem(itemId, event)}
              onOpen={() => onOpenItem(itemId)}
              onDragStart={(pointer) => onDragStart(itemId, pointer)}
              onContextMenu={(event) => onContextMenuItem?.(itemId, event)}
            />
          );
        }

        const isDropTarget = dropTargetFolderId === item.node.id;

        return (
          <FsDesktopIcon
            key={itemId}
            node={item.node}
            isSelected={selectedItemIds.includes(itemId)}
            isDropTarget={isDropTarget}
            position={item.position}
            compact={compact}
            onSelect={(event) => onSelectItem(itemId, event)}
            onOpen={() => onOpenItem(itemId)}
            onDragStart={(pointer) => onDragStart(itemId, pointer)}
            onContextMenu={(event) => onContextMenuItem?.(itemId, event)}
            onRename={onRenameItem ? () => onRenameItem(itemId) : undefined}
          />
        );
      })}
    </div>
  );
}

export const DesktopIcons = memo(DesktopIconsComponent);
