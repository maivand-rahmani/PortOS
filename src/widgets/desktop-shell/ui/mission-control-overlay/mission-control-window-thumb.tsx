import { motion } from "framer-motion";

import type { WindowRenderItem } from "../../model/desktop-shell.types";

type MissionControlWindowThumbProps = {
  item: WindowRenderItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
};

export function MissionControlWindowThumb({
  item,
  index,
  isSelected,
  onSelect,
}: MissionControlWindowThumbProps) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onSelect}
      className="absolute overflow-hidden rounded-[28px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] text-left shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      style={{
        left: `${16 + index * 8}%`,
        top: `${14 + index * 5}%`,
        width: "42%",
        height: "58%",
        zIndex: 20 + index,
      }}
      animate={{
        scale: isSelected ? 1.02 : 1,
        opacity: 1,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex h-11 items-center border-b border-white/10 bg-black/12 px-4 text-sm font-semibold text-white/86">
        {item.window.title}
      </div>
      <div className="flex h-[calc(100%-2.75rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.1))] px-4 text-center text-sm text-white/58">
        {item.app.name}
      </div>
    </motion.button>
  );
}
