"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Power-on pulse: A brief circular light emanation from the center,
 * simulating a display capacitor charging.
 */
export function PowerPulse() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.7, 0], scale: [0, 1.5, 2.5] }}
      transition={{ duration: 0.6, ease: "easeOut", times: [0, 0.4, 1] }}
    >
      <div
        className="h-40 w-40 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(147,197,253,0.35) 0%, rgba(59,130,246,0.12) 40%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}

/**
 * Backlight glow: A large soft radial gradient behind the logo
 * that slowly builds during the logo phase.
 */
export function BacklightGlow() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.8, ease: "easeOut" }}
    >
      <div
        className="h-80 w-80"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.04) 40%, transparent 65%)",
        }}
      />
    </motion.div>
  );
}

/**
 * Brightness bloom: Full-screen white overlay that fades during
 * the reveal phase, simulating display reaching full brightness.
 */
export function BrightnessBloom() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      className="absolute inset-0 bg-white"
      initial={{ opacity: 0.06 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  );
}
