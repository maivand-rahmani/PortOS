"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { DesktopBounds } from "@/entities/window";
import type { WindowSnapZone } from "@/processes";
import { getSnapFrame } from "@/processes/os/model/window-manager/window-manager.snap";

type SnapGuideOverlayProps = {
  zone: WindowSnapZone | null;
  bounds: DesktopBounds | null;
};

/**
 * Translucent overlay that previews where a window will land
 * when the user releases the drag near a screen edge or corner.
 *
 * Renders only while `zone` is non-null and fades in/out
 * with a short spring animation.
 */
export function SnapGuideOverlay({ zone, bounds }: SnapGuideOverlayProps) {
  const frame = zone && bounds ? getSnapFrame(zone, bounds) : null;

  return (
    <AnimatePresence>
      {frame ? (
        <motion.div
          key={zone}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="pointer-events-none absolute z-[9999] rounded-xl border border-white/20 bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.06)] backdrop-blur-md"
          style={{
            left: frame.position.x,
            top: frame.position.y,
            width: frame.size.width,
            height: frame.size.height,
          }}
        >
          {/* Inner highlight edge */}
          <div className="absolute inset-[1px] rounded-[10px] border border-white/8" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
