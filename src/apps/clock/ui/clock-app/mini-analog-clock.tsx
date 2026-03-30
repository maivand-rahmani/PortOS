import { motion } from "framer-motion";

import { cn } from "@/shared/lib";

import { getClockDate } from "../../model/time";

const FALLBACK_TICK = Date.UTC(2026, 0, 1, 12, 0, 0);

export function MiniAnalogClock({
  tick,
  timeZone,
  reduceMotion,
  compact = false,
}: {
  tick: number | null;
  timeZone: string;
  reduceMotion: boolean | null;
  compact?: boolean;
}) {
  const safeTick = tick ?? FALLBACK_TICK;
  const { hours, minutes, seconds } = getClockDate(timeZone, safeTick);

  return (
    <div
      className={cn(
        "clock-app__dial-ring relative mx-auto flex items-center justify-center rounded-full border border-white/14 bg-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_14px_36px_rgba(2,6,23,0.42)]",
        compact ? "h-[88px] w-[88px]" : "h-32 w-32",
      )}
    >
      <ClockHand rotation={hours * 30 + minutes * 0.5} length={compact ? "h-7" : "h-10"} width={compact ? "w-1" : "w-1.5"} color="bg-white" reduceMotion={reduceMotion} compact={compact} />
      <ClockHand rotation={minutes * 6} length={compact ? "h-8" : "h-12"} width="w-[3px]" color="bg-cyan-200" reduceMotion={reduceMotion} compact={compact} />
      <ClockHand rotation={seconds * 6} length={compact ? "h-8" : "h-12"} width="w-[2px]" color="bg-emerald-300" reduceMotion={reduceMotion} compact={compact} />
      <div className={cn("absolute rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)]", compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
    </div>
  );
}

function ClockHand({
  rotation,
  length,
  width,
  color,
  reduceMotion,
  compact,
}: {
  rotation: number;
  length: string;
  width: string;
  color: string;
  reduceMotion: boolean | null;
  compact: boolean;
}) {
  return (
    <motion.div
      animate={{ rotate: rotation }}
      transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
      className="absolute inset-0"
    >
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 rounded-full",
          compact ? "top-[20%]" : "top-[18%]",
          length,
          width,
          color,
        )}
      />
    </motion.div>
  );
}
