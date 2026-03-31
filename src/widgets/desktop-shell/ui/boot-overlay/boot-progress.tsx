"use client";

import { motion, useReducedMotion } from "framer-motion";

type BootProgressProps = {
  progress: number;
};

export function BootProgress({ progress }: BootProgressProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="mt-8 flex w-52 flex-col items-center gap-3"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/12">
        <motion.div
          className="h-full rounded-full bg-white/90"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0.1 }
              : { type: "spring", stiffness: 120, damping: 20 }
          }
        />
      </div>
    </motion.div>
  );
}
