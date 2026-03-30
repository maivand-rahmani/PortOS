import { motion } from "framer-motion";

import { buildFormattedWorldClockTime } from "@/shared/lib/app-logic";
import { cn } from "@/shared/lib";

import type { ClockTimeZoneOption } from "../../model/content";
import { buildClockComparisonLabel } from "../../model/time";
import { formatClockDateLabel } from "./clock-app.helpers";
import { MiniAnalogClock } from "./mini-analog-clock";

export function SpotlightPanel({
  city,
  tick,
  browserTimeZone,
  use24Hour,
  reduceMotion,
  monoClassName,
  focusSource,
  timePlaceholder,
}: {
  city: ClockTimeZoneOption;
  tick: number | null;
  browserTimeZone: string;
  use24Hour: boolean;
  reduceMotion: boolean | null;
  monoClassName: string;
  focusSource: string | null;
  timePlaceholder: string;
}) {
  const comparisonLabel = tick ? buildClockComparisonLabel(city.timeZone, browserTimeZone, tick) : `Loading against ${browserTimeZone}`;

  return (
    <motion.section
      initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      className="clock-app__hero relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] p-5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(125,211,252,0.12),transparent_22%)]" />
      <div className="relative grid gap-5 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
        <MiniAnalogClock tick={tick} timeZone={city.timeZone} reduceMotion={reduceMotion} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-300/54">
            <span>{city.timeZone}</span>
            <span className="text-slate-500">/</span>
            <span>{city.offsetLabel}</span>
            {focusSource ? (
              <span className="rounded-full border border-cyan-300/18 bg-cyan-300/12 px-2.5 py-1 text-[10px] tracking-[0.18em] text-cyan-100">
                {focusSource}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{city.city}</h2>
          <p className="mt-1 text-sm text-slate-300/58">{city.countryName} · {tick ? formatClockDateLabel(city.timeZone, tick) : "Preparing live time"}</p>
          <p className={cn("mt-5 text-[2.6rem] font-semibold tracking-tight text-white md:text-[3.4rem]", monoClassName)}>
            {tick ? buildFormattedWorldClockTime(city.timeZone, use24Hour, tick) : timePlaceholder}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-200/64">
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">{comparisonLabel}</span>
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">{city.continentName}</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
