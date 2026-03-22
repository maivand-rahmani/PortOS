import { motion } from "framer-motion";

import type { DockMenuAction, DockMenuModel } from "../../model/desktop-shell.types";
import { cn } from "@/shared/lib";

type DockMenuProps = {
  menu: DockMenuModel;
  onAction: (action: DockMenuAction) => void;
};

export function DockMenu({ menu, onAction }: DockMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="pointer-events-auto absolute z-[550] w-[260px] rounded-[24px] border border-white/35 bg-[linear-gradient(180deg,rgba(36,43,57,0.82),rgba(19,24,34,0.88))] p-2 text-white shadow-[0_24px_80px_rgba(3,8,18,0.42)] backdrop-blur-2xl"
      style={{
        left: menu.position.x,
        bottom: menu.position.y,
      }}
    >
      <div className="mb-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
        {menu.item.app.name}
      </div>

      <div className="space-y-1">
        {menu.entries.map((entry) => {
          if (entry.kind === "separator") {
            return <div key={entry.key} className="mx-2 my-1 h-px bg-white/12" />;
          }

          return (
            <button
              key={`${entry.action.id}-${"windowId" in entry.action ? entry.action.windowId : entry.action.appId}`}
              type="button"
              onClick={() => onAction(entry.action)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition duration-150 hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
                entry.action.id === "quit-app" && "text-[#ffb4ae] hover:bg-[#ff5f57]/14",
              )}
            >
              <span>{entry.action.label}</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/34">
                {entry.action.id.replace(/-/g, " ")}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
