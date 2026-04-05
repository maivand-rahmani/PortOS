import { motion } from "framer-motion";
import { Star, Target, X } from "lucide-react";

import { buildFormattedWorldClockTime } from "@/shared/lib/app-data/app-logic";
import { cn } from "@/shared/lib";

import type { ClockTimeZoneOption } from "../../model/content";
import { buildClockComparisonLabel, buildCompactLabel, getClockHour } from "../../model/time";
import { MiniAnalogClock } from "./mini-analog-clock";

export function CityClockCard({
  city,
  use24Hour,
  tick,
  index,
  isFavorite,
  isSpotlight,
  isHighlighted,
  browserTimeZone,
  reduceMotion,
  monoClassName,
  timePlaceholder,
  onRemove,
  onSetSpotlight,
  onToggleFavorite,
}: {
  city: ClockTimeZoneOption;
  use24Hour: boolean;
  tick: number | null;
  index: number;
  isFavorite: boolean;
  isSpotlight: boolean;
  isHighlighted: boolean;
  browserTimeZone: string;
  reduceMotion: boolean | null;
  monoClassName: string;
  timePlaceholder: string;
  onRemove: () => void;
  onSetSpotlight: () => void;
  onToggleFavorite: () => void;
}) {
  const hour = tick ? getClockHour(city.timeZone, tick) : 12;
  const isDay = hour >= 6 && hour < 18;
  const compactLabel = buildCompactLabel(city.timeZone, city.countryName);

  return (
    <motion.article
      layout
      initial={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.985 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -14, scale: 0.96 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.03, type: "spring", stiffness: 220, damping: 22 }}
      whileHover={reduceMotion ? undefined : { y: -4, rotateX: -6, rotateY: index % 2 === 0 ? 6 : -6 }}
      style={{ transformStyle: "preserve-3d", perspective: "1400px" }}
      className={cn(
        "group relative overflow-hidden rounded-[24px] border bg-slate-950/68 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.42)] backdrop-blur-xl transition duration-300",
        isSpotlight ? "border-cyan-300/36" : "border-white/10",
        isHighlighted && "ring-2 ring-cyan-300/55 ring-offset-0",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-90",
          isDay
            ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_60%)]"
            : "bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_60%)]",
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.22em] text-slate-300/48">{compactLabel}</p>
            <h3 className="mt-1 truncate text-lg font-semibold text-white">{city.city}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onSetSpotlight}
              className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/8 text-slate-100 transition duration-200 hover:border-cyan-300/44 hover:bg-cyan-300/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
              aria-label={`Spotlight ${city.city}`}
            >
              <Target className={cn("h-3.5 w-3.5", isSpotlight && "text-cyan-200")} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={onToggleFavorite}
              className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/8 text-slate-100 transition duration-200 hover:border-amber-300/44 hover:bg-amber-300/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
              aria-label={`${isFavorite ? "Remove" : "Add"} ${city.city} favorite`}
            >
              <Star className={cn("h-3.5 w-3.5", isFavorite ? "fill-amber-300 text-amber-300" : "text-slate-100")} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/8 text-slate-100 transition duration-200 hover:border-rose-300/44 hover:bg-rose-400/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
              aria-label={`Remove ${city.city}`}
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
          <MiniAnalogClock tick={tick} timeZone={city.timeZone} reduceMotion={reduceMotion} compact />

          <div className="min-w-0">
            <p className={cn("truncate text-[1.45rem] font-semibold tracking-tight text-white md:text-[1.8rem]", monoClassName)}>
              {tick ? buildFormattedWorldClockTime(city.timeZone, use24Hour, tick) : timePlaceholder}
            </p>
            <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-cyan-200/68">{city.offsetLabel}</p>
            <p className="mt-2 truncate text-xs text-slate-300/56">
              {tick ? buildClockComparisonLabel(city.timeZone, browserTimeZone, tick) : `Waiting for ${browserTimeZone}`}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
