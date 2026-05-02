"use client";

import { useState } from "react";
import { cn } from "@/shared/lib";
import type {
  ContextMenuActionItem,
  ContextMenuSubmenuItem,
  ContextMenuItem,
} from "../../model/desktop-context-menu/desktop-context-menu.types";
import { DesktopContextMenuSeparator } from "./desktop-context-menu-separator";

type ContextMenuItemProps = {
  item: ContextMenuActionItem | ContextMenuSubmenuItem;
  onAction: (actionId: string) => void;
  depth?: number;
};

export function DesktopContextMenuItem({
  item,
  onAction,
  depth = 0,
}: ContextMenuItemProps) {
  if (item.kind === "action") {
    return (
      <button
        type="button"
        onClick={() => onAction(item.id)}
        disabled={item.disabled}
        className={cn(
          "flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-[13px] transition-colors duration-150",
          item.destructive
            ? "text-[#ffb4ae] hover:bg-[#ff5f57]/14"
            : "hover:bg-white/12",
          item.disabled && "pointer-events-none opacity-50",
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {item.icon && <span className="text-[15px]">{item.icon}</span>}
        <span className="flex-1 text-left">{item.label}</span>
        {item.checked && (
          <span className="text-[12px] text-white/60">✓</span>
        )}
        {!item.checked && item.shortcut && (
          <span className="text-[11px] tracking-[0.18em] text-white/34">
            {item.shortcut}
          </span>
        )}
      </button>
    );
  }

  return <SubmenuItem item={item} onAction={onAction} depth={depth} />;
}

function SubmenuItem({
  item,
  onAction,
  depth,
}: {
  item: ContextMenuSubmenuItem;
  onAction: (actionId: string) => void;
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-[13px] transition-colors duration-150 hover:bg-white/12",
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {item.icon && <span className="text-[15px]">{item.icon}</span>}
        <span className="flex-1 text-left">{item.label}</span>
        <span
          className={cn(
            "text-[12px] text-white/50 transition-transform duration-150",
            isOpen && "rotate-90",
          )}
        >
          ›
        </span>
      </button>
      {isOpen && (
        <div>
          {item.children.map((child) => {
            if (child.kind === "separator") {
              return <DesktopContextMenuSeparator key={child.key} />;
            }
            return (
              <DesktopContextMenuItem
                key={child.id}
                item={child}
                onAction={onAction}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
