"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { AnimatePresence, LayoutGroup, Reorder, motion, useReducedMotion } from "framer-motion";
import { MoonStar, Search, SunMedium } from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import {
  CLOCK_FOCUS_REQUEST_EVENT,
  type ClockFocusRequest,
  consumeClockFocusRequest,
} from "@/shared/lib/clock-os-events";
import { cn } from "@/shared/lib";

import {
  getClockTimeZoneOptions,
  getDefaultClockTimeZones,
  type ClockTimeZoneOption,
} from "../../model/content";
import {
  buildClockComparisonLabel,
  buildTomorrowMorningPlannerValue,
  getClockHour,
  shiftPlannerDateTime,
  sortByFavoriteOrder,
} from "../../model/time";
import {
  buildPlannerSummary,
  createInitialPlannerValue,
  createNowPlannerValue,
  createTimePlaceholder,
  getBrowserTimeZone,
  getPlannerStatus,
  readFavoriteOrderSnapshot,
  readFavoriteTimeZonesSnapshot,
  saveFavoriteOrder,
  saveFavoriteTimeZones,
  formatPlannerTimeLabel,
  subscribeToBrowserTimeZone,
  subscribeToClockStorage,
} from "./clock-app.helpers";
import { CityClockCard } from "./city-clock-card";
import { FavoriteChip } from "./favorite-chip";
import { PlannerPanel } from "./planner-panel";
import { SearchResultsPanel } from "./search-results-panel";
import { SpotlightPanel } from "./spotlight-panel";

const clockOptions = getClockTimeZoneOptions();
const defaultCities = getDefaultClockTimeZones(clockOptions);

export function ClockApp({ processId, windowId }: AppComponentProps) {
  const favoriteTimeZonesSnapshot = useSyncExternalStore(
    subscribeToClockStorage,
    readFavoriteTimeZonesSnapshot,
    () => "[]",
  );
  const favoriteOrderSnapshot = useSyncExternalStore(
    subscribeToClockStorage,
    readFavoriteOrderSnapshot,
    () => "[]",
  );
  const browserTimeZone = useSyncExternalStore(subscribeToBrowserTimeZone, getBrowserTimeZone, () => "UTC");
  const [tick, setTick] = useState<number | null>(null);
  const [use24Hour, setUse24Hour] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState<ClockTimeZoneOption[]>(() => defaultCities);
  const [spotlightTimeZone, setSpotlightTimeZone] = useState(defaultCities[0]?.timeZone ?? "UTC");
  const [highlightedTimeZone, setHighlightedTimeZone] = useState<string | null>(null);
  const [focusSource, setFocusSource] = useState<string | null>(null);
  const [plannerValue, setPlannerValue] = useState(createInitialPlannerValue);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "unsupported">("idle");
  const reduceMotion = useReducedMotion();

  const favoriteTimeZones = useMemo(() => {
    try {
      return new Set(JSON.parse(favoriteTimeZonesSnapshot) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [favoriteTimeZonesSnapshot]);

  const favoriteOrder = useMemo(() => {
    try {
      return JSON.parse(favoriteOrderSnapshot) as string[];
    } catch {
      return [] as string[];
    }
  }, [favoriteOrderSnapshot]);

  useEffect(() => {
    const updateTick = () => {
      setTick(Date.now());
      setPlannerValue((current) => current || buildTomorrowMorningPlannerValue());
    };

    updateTick();

    const intervalId = window.setInterval(updateTick, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const applyFocusRequest = (detail: ClockFocusRequest | null) => {
      if (!detail?.timeZone) {
        return;
      }

      if (detail.targetWindowId && detail.targetWindowId !== windowId) {
        return;
      }

      const matchedCity = clockOptions.find((option) => option.timeZone === detail.timeZone);

      if (!matchedCity) {
        return;
      }

      setCities((current) => {
        if (current.some((city) => city.timeZone === matchedCity.timeZone)) {
          return current;
        }

        return [matchedCity, ...current];
      });
      setSpotlightTimeZone(matchedCity.timeZone);
      setHighlightedTimeZone(detail.highlight === false ? null : matchedCity.timeZone);
      setFocusSource(detail.source ? `Requested by ${detail.source}` : "Focused from another PortOS app");
      setSearchQuery("");
    };

    const handleClockFocus = (event: Event) => {
      applyFocusRequest((event as CustomEvent<ClockFocusRequest>).detail);
    };

    applyFocusRequest(consumeClockFocusRequest(windowId));
    window.addEventListener(CLOCK_FOCUS_REQUEST_EVENT, handleClockFocus);

    return () => {
      window.removeEventListener(CLOCK_FOCUS_REQUEST_EVENT, handleClockFocus);
    };
  }, [windowId]);

  useEffect(() => {
    if (!highlightedTimeZone) {
      return;
    }

    const timeoutId = window.setTimeout(() => setHighlightedTimeZone(null), 2400);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedTimeZone]);

  useEffect(() => {
    if (copyStatus !== "copied") {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyStatus("idle"), 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  const resolvedSpotlightTimeZone = cities.some((city) => city.timeZone === spotlightTimeZone)
    ? spotlightTimeZone
    : cities[0]?.timeZone ?? browserTimeZone;

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

  const activeHours = tick
    ? cities.filter((city) => {
        const hour = getClockHour(city.timeZone, tick);

        return hour >= 8 && hour < 18;
      }).length
    : 0;

  const spotlightCity = cities.find((city) => city.timeZone === resolvedSpotlightTimeZone) ?? cities[0] ?? null;
  const plannerTimestamp = Number.isNaN(Date.parse(plannerValue)) ? null : Date.parse(plannerValue);

  const plannerRows = useMemo(() => {
    if (!plannerTimestamp) {
      return [];
    }

    return cities.map((city) => ({
      city,
      timeLabel: formatPlannerTimeLabel(city.timeZone, plannerTimestamp, use24Hour),
      comparisonLabel: buildClockComparisonLabel(city.timeZone, browserTimeZone, plannerTimestamp),
      status: getPlannerStatus(getClockHour(city.timeZone, plannerTimestamp)),
    }));
  }, [browserTimeZone, cities, plannerTimestamp, use24Hour]);

  const timePlaceholder = createTimePlaceholder(use24Hour);

  const handleAddCity = (option: ClockTimeZoneOption) => {
    setCities((current) => {
      if (current.some((city) => city.timeZone === option.timeZone)) {
        return current;
      }

      return [...current, option];
    });
    setSpotlightTimeZone(option.timeZone);
    setFocusSource("Added from search");
    setSearchQuery("");
  };

  const handleRemoveCity = (timeZone: string) => {
    setCities((current) => current.filter((city) => city.timeZone !== timeZone));
  };

  const handleSpotlight = (timeZone: string, source: string) => {
    setSpotlightTimeZone(timeZone);
    setFocusSource(source);
  };

  const toggleFavorite = (timeZone: string) => {
    const willBeFavorite = !favoriteTimeZones.has(timeZone);
    const nextFavorites = new Set(favoriteTimeZones);

    if (willBeFavorite) {
      nextFavorites.add(timeZone);
    } else {
      nextFavorites.delete(timeZone);
    }

    saveFavoriteTimeZones(nextFavorites);

    const nextOrder = willBeFavorite
      ? favoriteOrder.includes(timeZone)
        ? favoriteOrder
        : [...favoriteOrder, timeZone]
      : favoriteOrder.filter((item) => item !== timeZone);

    saveFavoriteOrder(nextOrder);
  };

  const handleReorderFavorites = (items: ClockTimeZoneOption[]) => {
    const nextOrder = items.map((item) => item.timeZone);

    saveFavoriteOrder(nextOrder);
  };

  const handleCopyPlanner = async () => {
    if (!plannerTimestamp || typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus("unsupported");
      return;
    }

    await navigator.clipboard.writeText(
      buildPlannerSummary(cities, plannerTimestamp, use24Hour, browserTimeZone, getClockHour),
    );
    setCopyStatus("copied");
  };

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.99 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn("clock-app flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4 font-clock-sans")}
    >
      <div className="clock-app__panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-white/12 bg-slate-950/72 p-4 shadow-[0_24px_72px_rgba(2,6,23,0.54)] backdrop-blur-xl md:p-5">
        <motion.header
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="flex flex-col gap-4 border-b border-white/10 pb-4"
        >
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto] xl:items-center">
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
              <span className="text-slate-400">cities</span>
              <span className="text-slate-400">/</span>
              <span>{favoriteCities.length}</span>
              <span className="text-slate-400">saved</span>
              <span className="text-slate-400">/</span>
              <span>{activeHours}</span>
              <span className="text-slate-400">live</span>
            </div>

            <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-300/54">
              Session {processId.slice(0, 6)}
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
                  onSpotlight={() => handleSpotlight(city.timeZone, "Focused from favorites")}
                  onToggleFavorite={() => toggleFavorite(city.timeZone)}
                />
              ))}
            </Reorder.Group>
          ) : null}
        </motion.header>

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="flex min-h-0 flex-col gap-4 overflow-hidden">
            {spotlightCity ? (
              <SpotlightPanel
                city={spotlightCity}
                tick={tick}
                browserTimeZone={browserTimeZone}
                use24Hour={use24Hour}
                reduceMotion={reduceMotion}
                monoClassName="font-clock-mono"
                focusSource={focusSource}
                timePlaceholder={timePlaceholder}
              />
            ) : null}

            <div className="min-h-0 flex-1 overflow-auto pr-1">
              <LayoutGroup>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {cities.map((item, index) => (
                      <CityClockCard
                        key={item.timeZone}
                        city={item}
                        use24Hour={use24Hour}
                        tick={tick}
                        index={index}
                        isFavorite={favoriteTimeZones.has(item.timeZone)}
                        isSpotlight={item.timeZone === resolvedSpotlightTimeZone}
                        isHighlighted={item.timeZone === highlightedTimeZone}
                        browserTimeZone={browserTimeZone}
                        reduceMotion={reduceMotion}
                        monoClassName="font-clock-mono"
                        timePlaceholder={timePlaceholder}
                        onRemove={() => handleRemoveCity(item.timeZone)}
                        onSetSpotlight={() => handleSpotlight(item.timeZone, "Focused inside Clock")}
                        onToggleFavorite={() => toggleFavorite(item.timeZone)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col gap-4 overflow-hidden">
            <PlannerPanel
              plannerValue={plannerValue}
              browserTimeZone={browserTimeZone}
              copyStatus={copyStatus}
              plannerRows={plannerRows}
              spotlightTimeZone={resolvedSpotlightTimeZone}
              onCopy={() => void handleCopyPlanner()}
              onChangePlannerValue={setPlannerValue}
              onShiftHours={(hours) => setPlannerValue((current) => shiftPlannerDateTime(current, hours))}
              onSetNow={() => setPlannerValue(createNowPlannerValue())}
              onSetTomorrowMorning={() => setPlannerValue(buildTomorrowMorningPlannerValue())}
              onSpotlight={(timeZone) => handleSpotlight(timeZone, "Planner focus")}
            />

            <SearchResultsPanel
              filteredResults={filteredResults}
              favoriteTimeZones={favoriteTimeZones}
              reduceMotion={reduceMotion}
              searchQuery={searchQuery}
              onAdd={handleAddCity}
              onToggleFavorite={toggleFavorite}
            />
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
