"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { OSBootPhase } from "@/processes";

import { BootLogo } from "./boot-logo";
import { BootProgress } from "./boot-progress";
import { BootMessages } from "./boot-messages";
import { BacklightGlow, BrightnessBloom, PowerPulse } from "./boot-effects";

type BootOverlayProps = {
  phase: Exclude<OSBootPhase, "ready">;
  progress: number;
  messages: string[];
};

export function BootOverlay({ phase, progress, messages }: BootOverlayProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: {
          duration: shouldReduceMotion ? 0.15 : 0.6,
          ease: "easeOut",
        },
      }}
      className="absolute inset-0 z-[900] flex items-center justify-center overflow-hidden bg-[#050508]"
    >
      {/* Dark ambient background - transitions from pure black to deep gradient */}
      <AnimatePresence>
        {(phase === "logo" || phase === "init" || phase === "reveal") && (
          <motion.div
            key="bg-gradient"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0.1 : 1.5,
              ease: "easeOut",
            }}
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(15,23,42,0.9) 0%, rgba(5,5,8,1) 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase: Power On - brief light pulse */}
      <AnimatePresence>
        {phase === "power-on" && (
          <motion.div
            key="power-on"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <PowerPulse />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Logo + Init - centered logo with glow */}
      <AnimatePresence>
        {(phase === "logo" || phase === "init") && (
          <motion.div
            key="logo-phase"
            className="relative z-10 flex flex-col items-center"
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeIn" } }
            }
          >
            <BacklightGlow />

            <BootLogo phase={phase} />

            {/* Brand text */}
            <motion.h1
              className="mt-5 text-xl font-bold tracking-tight text-white/90"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.6, duration: 0.4, ease: "easeOut" }}
            >
              PortOS
            </motion.h1>

            <motion.p
              className="mt-1.5 text-[12px] tracking-wide text-white/40"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.9, duration: 0.4 }}
            >
              Portfolio Desktop Environment
            </motion.p>

            {/* Progress bar + messages (init phase only) */}
            <AnimatePresence>
              {phase === "init" && (
                <motion.div
                  key="init-ui"
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <BootProgress progress={progress} />
                  <BootMessages messages={messages} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Reveal - brightness bloom */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div key="reveal" className="absolute inset-0">
            <BrightnessBloom />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
