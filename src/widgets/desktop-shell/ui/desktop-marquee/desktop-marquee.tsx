"use client";

import { motion } from "framer-motion";
import type { DesktopMarqueeState } from "../../model/use-desktop-marquee";

interface DesktopMarqueeProps {
  state: DesktopMarqueeState;
}

export function DesktopMarquee({ state }: DesktopMarqueeProps) {
  if (!state.isActive) return null;

  const { startX, startY, currentX, currentY } = state;
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute z-20"
      style={{
        left,
        top,
        width,
        height,
        border: "1px solid rgba(10, 132, 255, 0.6)",
        backgroundColor: "rgba(10, 132, 255, 0.12)",
      }}
    />
  );
}
