"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AnimatePresence,
  LayoutGroup,
  Reorder,
  motion,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { GripVertical, MoonStar, Plus, Search, Star, SunMedium, X } from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import { buildFormattedWorldClockTime } from "@/shared/lib/app-logic";
import { cn } from "@/shared/lib";

import {
  getClockTimeZoneOptions,
  getDefaultClockTimeZones,
  type ClockTimeZoneOption,
} from "../model/content";

const displayFont = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bodyFont = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const clockOptions = getClockTimeZoneOptions();
const defaultCities = getDefaultClockTimeZones(clockOptions);
const favoriteStorageKey = "portos-clock-favorites";
const favoriteOrderStorageKey = "portos-clock-favorite-order";

function readFavoriteTimeZones() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const stored = window.localStorage.getItem(favoriteStorageKey);

    if (!stored) {
      return new Set<string>();
    }

    return new Set(JSON.parse(stored) as string[]);
  } catch {
    return new Set<string>();
  }
}

function saveFavoriteTimeZones(favorites: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(favoriteStorageKey, JSON.stringify([...favorites]));
}

function readFavoriteOrder() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const stored = window.localStorage.getItem(favoriteOrderStorageKey);

    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [] as string[];
  }
}

function saveFavoriteOrder(order: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(favoriteOrderStorageKey, JSON.stringify(order));
}

function getClockHour(timeZone: string, tick: number) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone,
    }).format(new Date(tick)),
  );
}

function getClockDate(timeZone: string, tick: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone,
  }).formatToParts(new Date(tick));

  const lookup = (type: "hour" | "minute" | "second") =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    hours: lookup("hour"),
    minutes: lookup("minute"),
    seconds: lookup("second"),
  };
}

function buildCompactLabel(timeZone: string, countryName: string) {
  if (timeZone === "UTC") {
    return "UTC";
  }

  return countryName;
}

function sortByFavoriteOrder(options: ClockTimeZoneOption[], favoriteOrder: string[]) {
  const orderMap = new Map(favoriteOrder.map((timeZone, index) => [timeZone, index]));

  return [...options].sort((left, right) => {
    const leftIndex = orderMap.get(left.timeZone);
    const rightIndex = orderMap.get(right.timeZone);

    if (leftIndex !== undefined && rightIndex !== undefined) {
      return leftIndex - rightIndex;
    }

    if (leftIndex !== undefined) {
      return -1;
    }

    if (rightIndex !== undefined) {
      return 1;
    }

    return left.city.localeCompare(right.city);
  });
}

export function ClockApp({ processId }: AppComponentProps) {
  const [tick, setTick] = useState(() => Date.now());
  const [use24Hour, setUse24Hour] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState<ClockTimeZoneOption[]>(() => defaultCities);
  const [favoriteTimeZones, setFavoriteTimeZones] = useState<Set<string>>(() => readFavoriteTimeZones());
  const [favoriteOrder, setFavoriteOrder] = useState<string[]>(() => readFavoriteOrder());
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const updateTick = () => setTick(Date.now());

    updateTick();

    const intervalId = window.setInterval(updateTick, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const visibleTimeZones = useMemo(() => new Set(cities.map((city) => city.timeZone)), [cities]);

  const favoriteCities = useMemo(() => {
    const activeFavorites = clockOptions.filter((option) => favoriteTimeZones.has(option.timeZone));

    return sortByFavoriteOrder(activeFavorites, favoriteOrder);
  }, [favoriteOrder, favoriteTimeZones]);

  const filteredResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matches = clockOptions.filter((option) => {
      if (visibleTimeZones.has(option.timeZone)) {
        return false;
      }

      if (!normalizedQuery) {
        return favoriteTimeZones.has(option.timeZone);
      }

      return option.searchLabel.includes(normalizedQuery);
    });

    return matches
      .sort((left, right) => {
        const favoriteDifference = Number(favoriteTimeZones.has(right.timeZone)) - Number(favoriteTimeZones.has(left.timeZone));

        if (favoriteDifference !== 0) {
          return favoriteDifference;
        }

        return left.city.localeCompare(right.city);
      })
      .slice(0, normalizedQuery ? 14 : 8);
  }, [favoriteTimeZones, searchQuery, visibleTimeZones]);

  const activeHours = cities.filter((city) => {
    const hour = getClockHour(city.timeZone, tick);

    return hour >= 8 && hour < 18;
  }).length;

  const handleAddCity = (option: ClockTimeZoneOption) => {
    setCities((current) => {
      if (current.some((city) => city.timeZone === option.timeZone)) {
        return current;
      }

      return [...current, option];
    });
    setSearchQuery("");
  };

  const handleRemoveCity = (timeZone: string) => {
    setCities((current) => current.filter((city) => city.timeZone !== timeZone));
  };

  const toggleFavorite = (timeZone: string) => {
    setFavoriteTimeZones((current) => {
      const next = new Set(current);

      if (next.has(timeZone)) {
        next.delete(timeZone);
      } else {
        next.add(timeZone);
      }

      saveFavoriteTimeZones(next);
      return next;
    });

    setFavoriteOrder((current) => {
      const alreadyIncluded = current.includes(timeZone);
      const isFavorite = favoriteTimeZones.has(timeZone);
      const next = isFavorite ? current.filter((item) => item !== timeZone) : alreadyIncluded ? current : [...current, timeZone];

      saveFavoriteOrder(next);
      return next;
    });
  };

  const handleReorderFavorites = (items: ClockTimeZoneOption[]) => {
    const nextOrder = items.map((item) => item.timeZone);

    setFavoriteOrder(nextOrder);
    saveFavoriteOrder(nextOrder);
  };

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.99 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn("clock-app flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4", bodyFont.className)}
    >
      <div className="clock-app__panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-white/12 bg-slate-950/72 p-4 shadow-[0_24px_72px_rgba(2,6,23,0.54)] backdrop-blur-xl md:p-5">
        <motion.header
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="flex flex-col gap-4 border-b border-white/10 pb-4"
        >
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
            <label className="flex min-h-[54px] items-center rounded-[22px] border border-white/12 bg-white/8 px-4 shadow-[0_12px_30px_rgba(2,6,23,0.22)]">
              <Search className="mr-3 h-4 w-4 shrink-0 text-cyan-300" strokeWidth={2.2} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search city, country, or timezone"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-300/42"
              />
            </label>

            <div className="flex items-center gap-2 rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-sm text-slate-200/68">
              <span>{cities.length}</span>
              <span className="text-slate-400">/</span>
              <span>{favoriteCities.length}</span>
              <span className="text-slate-400">/</span>
              <span>{activeHours}</span>
            </div>

            <button
              type="button"
              onClick={() => setUse24Hour((current) => !current)}
              className="inline-flex min-h-[54px] cursor-pointer items-center justify-center gap-2 rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:border-cyan-300/40 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
            >
              {use24Hour ? <MoonStar className="h-4 w-4" strokeWidth={2.2} /> : <SunMedium className="h-4 w-4" strokeWidth={2.2} />}
              {use24Hour ? "12h" : "24h"}
            </button>
          </div>

          {favoriteCities.length > 0 ? (
            <Reorder.Group
              axis="x"
              values={favoriteCities}
              onReorder={handleReorderFavorites}
              className="flex gap-2 overflow-auto pb-1"
            >
              {favoriteCities.map((city) => (
                <FavoriteChip
                  key={city.timeZone}
                  city={city}
                  onAdd={() => handleAddCity(city)}
                  onToggleFavorite={() => toggleFavorite(city.timeZone)}
                />
              ))}
            </Reorder.Group>
          ) : null}
        </motion.header>

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="flex min-h-0 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-auto pr-1">
              <LayoutGroup>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  <AnimatePresence initial={false} mode="popLayout">
                    {cities.map((item, index) => (
                      <CityClockCard
                        key={item.timeZone}
                        city={item}
                        use24Hour={use24Hour}
                        tick={tick}
                        index={index}
                        isFavorite={favoriteTimeZones.has(item.timeZone)}
                        reduceMotion={reduceMotion}
                        monoClassName={displayFont.className}
                        onRemove={() => handleRemoveCity(item.timeZone)}
                        onToggleFavorite={() => toggleFavorite(item.timeZone)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center justify-between gap-3 px-1 pb-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-200/52">Results</p>
              <span className="text-xs text-slate-300/54">{filteredResults.length}</span>
            </div>

            <div className="min-h-0 flex-1 overflow-auto pr-1">
              <div className="space-y-2.5">
                {filteredResults.length > 0 ? (
                  filteredResults.map((option, index) => (
                    <SearchResultCard
                      key={option.timeZone}
                      option={option}
                      index={index}
                      isFavorite={favoriteTimeZones.has(option.timeZone)}
                      reduceMotion={reduceMotion}
                      onAdd={() => handleAddCity(option)}
                      onToggleFavorite={() => toggleFavorite(option.timeZone)}
                    />
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-white/12 bg-white/5 px-4 py-8 text-center text-sm text-slate-300/62">
                    {searchQuery.trim() ? "No results" : "Search or save favorites"}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

function FavoriteChip({
  city,
  onAdd,
  onToggleFavorite,
}: {
  city: ClockTimeZoneOption;
  onAdd: () => void;
  onToggleFavorite: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={city}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{ scale: 1.03, boxShadow: "0 12px 34px rgba(2,6,23,0.45)" }}
      className="shrink-0 list-none"
    >
      <div className="flex min-h-[48px] items-center gap-2 rounded-[18px] border border-amber-300/18 bg-amber-300/10 px-3 py-2 text-amber-50 shadow-[0_10px_24px_rgba(120,53,15,0.14)]">
        <button
          type="button"
          onPointerDown={(event) => dragControls.start(event)}
          className="inline-flex min-h-[32px] min-w-[28px] cursor-grab items-center justify-center rounded-full text-amber-100/72 active:cursor-grabbing"
          aria-label={`Reorder ${city.city}`}
        >
          <GripVertical className="h-4 w-4" strokeWidth={2.3} />
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="cursor-pointer text-sm font-semibold"
        >
          {city.city}
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="ml-1 inline-flex min-h-[30px] min-w-[30px] cursor-pointer items-center justify-center rounded-full border border-amber-300/24 bg-white/8 text-amber-100"
          aria-label={`Remove ${city.city} favorite`}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      </div>
    </Reorder.Item>
  );
}

function CityClockCard({
  city,
  use24Hour,
  tick,
  index,
  isFavorite,
  reduceMotion,
  monoClassName,
  onRemove,
  onToggleFavorite,
}: {
  city: ClockTimeZoneOption;
  use24Hour: boolean;
  tick: number;
  index: number;
  isFavorite: boolean;
  reduceMotion: boolean | null;
  monoClassName: string;
  onRemove: () => void;
  onToggleFavorite: () => void;
}) {
  const hour = getClockHour(city.timeZone, tick);
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
      className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/68 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.42)] backdrop-blur-xl"
    >
      <div className={cn("absolute inset-0 opacity-90", isDay ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_60%)]" : "bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_60%)]")} />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.22em] text-slate-300/48">{compactLabel}</p>
            <h3 className="mt-1 truncate text-lg font-semibold text-white">{city.city}</h3>
          </div>

          <div className="flex items-center gap-1.5">
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
              {buildFormattedWorldClockTime(city.timeZone, use24Hour)}
            </p>
            <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-cyan-200/68">{city.offsetLabel}</p>
            <p className="mt-2 truncate text-xs text-slate-300/48">{city.timeZone}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MiniAnalogClock({
  tick,
  timeZone,
  reduceMotion,
  compact = false,
}: {
  tick: number;
  timeZone: string;
  reduceMotion: boolean | null;
  compact?: boolean;
}) {
  const { hours, minutes, seconds } = getClockDate(timeZone, tick);

  return (
    <div
      className={cn(
        "relative mx-auto flex items-center justify-center rounded-full border border-white/14 bg-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_14px_36px_rgba(2,6,23,0.42)]",
        compact ? "h-[88px] w-[88px]" : "h-32 w-32",
      )}
    >
      <div className={cn("absolute rounded-full border border-white/10", compact ? "inset-2.5" : "inset-3")} />
      <Hand rotation={hours * 30 + minutes * 0.5} length={compact ? "h-7" : "h-10"} width={compact ? "w-1" : "w-1.5"} color="bg-white" reduceMotion={reduceMotion} compact={compact} />
      <Hand rotation={minutes * 6} length={compact ? "h-8" : "h-12"} width="w-[3px]" color="bg-cyan-200" reduceMotion={reduceMotion} compact={compact} />
      <Hand rotation={seconds * 6} length={compact ? "h-8" : "h-12"} width="w-[2px]" color="bg-emerald-300" reduceMotion={reduceMotion} compact={compact} />
      <div className={cn("absolute rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)]", compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
    </div>
  );
}

function Hand({
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

function SearchResultCard({
  option,
  index,
  isFavorite,
  reduceMotion,
  onAdd,
  onToggleFavorite,
}: {
  option: ClockTimeZoneOption;
  index: number;
  isFavorite: boolean;
  reduceMotion: boolean | null;
  onAdd: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
      animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.025, duration: 0.18, ease: "easeOut" }}
      className="rounded-[18px] border border-white/10 bg-white/6 p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{option.city}</p>
          <p className="mt-1 truncate text-xs text-slate-300/52">{option.countryName} · {option.offsetLabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleFavorite}
            className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/8 text-slate-100 transition duration-200 hover:border-amber-300/44 hover:bg-amber-300/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
            aria-label={`${isFavorite ? "Remove" : "Add"} ${option.city} favorite`}
          >
            <Star className={cn("h-3.5 w-3.5", isFavorite ? "fill-amber-300 text-amber-300" : "text-slate-100")} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full bg-cyan-400 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-950 transition duration-200 hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
