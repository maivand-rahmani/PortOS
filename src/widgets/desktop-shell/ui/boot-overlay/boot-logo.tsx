"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

type BootLogoProps = {
  phase: "logo" | "init";
};

const DRAW_DURATION = 1.2;
const FILL_DELAY = 0.8;
const FILL_DURATION = 0.6;

export function BootLogo({ phase }: BootLogoProps) {
  const shouldReduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<number[]>([]);

  const handleClick = useCallback(() => {
    if (phase !== "init") return;
    setRipples((prev) => [...prev, Date.now()]);
  }, [phase]);

  const drawTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: DRAW_DURATION, ease: "easeInOut" as const };

  const fillTransition = shouldReduceMotion
    ? { duration: 0 }
    : { delay: FILL_DELAY, duration: FILL_DURATION, ease: "easeOut" as const };

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={handleClick}
      role="presentation"
    >
      {/* Glow behind logo */}
      <motion.div
        className="absolute h-32 w-32 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(10,132,255,0.18) 0%, rgba(10,132,255,0.06) 50%, transparent 70%)",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1.4 }}
        transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
      />

      {/* Logo SVG */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        aria-label="PortOS logo"
      >
        <defs>
          <linearGradient
            id="boot-logo-fill"
            x1="8"
            y1="8"
            x2="72"
            y2="72"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient
            id="boot-logo-stroke"
            x1="8"
            y1="8"
            x2="72"
            y2="72"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <filter id="boot-logo-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer rounded square - stroke draws on, then fills */}
        <motion.rect
          x="10"
          y="10"
          width="60"
          height="60"
          rx="16"
          stroke="url(#boot-logo-stroke)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={drawTransition}
        />
        <motion.rect
          x="10"
          y="10"
          width="60"
          height="60"
          rx="16"
          fill="url(#boot-logo-fill)"
          initial={{ fillOpacity: 0 }}
          animate={{ fillOpacity: 0.12 }}
          transition={fillTransition}
        />

        {/* Monitor/screen shape */}
        <motion.rect
          x="22"
          y="20"
          width="36"
          height="26"
          rx="4"
          stroke="url(#boot-logo-stroke)"
          strokeWidth="1.8"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            ...drawTransition,
            delay: shouldReduceMotion ? 0 : 0.2,
          }}
        />
        <motion.rect
          x="22"
          y="20"
          width="36"
          height="26"
          rx="4"
          fill="url(#boot-logo-fill)"
          initial={{ fillOpacity: 0 }}
          animate={{ fillOpacity: 0.2 }}
          transition={fillTransition}
        />

        {/* Screen content - three horizontal lines */}
        <motion.line
          x1="28"
          y1="28"
          x2="44"
          y2="28"
          stroke="#93c5fd"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{
            ...drawTransition,
            delay: shouldReduceMotion ? 0 : 0.5,
          }}
        />
        <motion.line
          x1="28"
          y1="33"
          x2="52"
          y2="33"
          stroke="#93c5fd"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{
            ...drawTransition,
            delay: shouldReduceMotion ? 0 : 0.6,
          }}
        />
        <motion.line
          x1="28"
          y1="38"
          x2="38"
          y2="38"
          stroke="#93c5fd"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.55 }}
          transition={{
            ...drawTransition,
            delay: shouldReduceMotion ? 0 : 0.7,
          }}
        />

        {/* Stand/base */}
        <motion.path
          d="M36 46 L36 52 L30 56 L50 56 L44 52 L44 46"
          stroke="url(#boot-logo-stroke)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            ...drawTransition,
            delay: shouldReduceMotion ? 0 : 0.4,
          }}
        />

        {/* Glass reflection highlight */}
        <motion.rect
          x="24"
          y="22"
          width="14"
          height="8"
          rx="3"
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={fillTransition}
        />
      </svg>

      {/* Breathing pulse */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 z-0"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)",
            }}
          />
        </motion.div>
      )}

      {/* Click ripples */}
      {ripples.map((id) => (
        <motion.div
          key={id}
          className="absolute left-1/2 top-1/2 z-20 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onAnimationComplete={() => {
            setRipples((prev) => prev.filter((r) => r !== id));
          }}
        />
      ))}
    </motion.div>
  );
}
