import type { ClockTimeZoneOption } from "../../model/content";
import { buildPlannerInputValue } from "../../model/time";

export const favoriteStorageKey = "portos-clock-favorites";
export const favoriteOrderStorageKey = "portos-clock-favorite-order";
const CLOCK_STORAGE_EVENT = "portos:clock-storage-change";

export type PlannerStatus = "ideal" | "early" | "late" | "overnight";

export function readFavoriteTimeZones() {
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

export function saveFavoriteTimeZones(favorites: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(favoriteStorageKey, JSON.stringify([...favorites]));
  window.dispatchEvent(new Event(CLOCK_STORAGE_EVENT));
}

export function readFavoriteOrder() {
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

export function saveFavoriteOrder(order: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(favoriteOrderStorageKey, JSON.stringify(order));
  window.dispatchEvent(new Event(CLOCK_STORAGE_EVENT));
}

export function subscribeToClockStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(CLOCK_STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(CLOCK_STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function readFavoriteTimeZonesSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  return window.localStorage.getItem(favoriteStorageKey) ?? "[]";
}

export function readFavoriteOrderSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  return window.localStorage.getItem(favoriteOrderStorageKey) ?? "[]";
}

export function subscribeToBrowserTimeZone(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("focus", onStoreChange);
  document.addEventListener("visibilitychange", onStoreChange);

  return () => {
    window.removeEventListener("focus", onStoreChange);
    document.removeEventListener("visibilitychange", onStoreChange);
  };
}

export function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function formatClockDateLabel(timeZone: string, tick: number) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(new Date(tick));
}

export function formatPlannerTimeLabel(timeZone: string, timestamp: number, use24Hour: boolean) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: use24Hour ? "2-digit" : "numeric",
    minute: "2-digit",
    hour12: !use24Hour,
    timeZone,
  }).format(new Date(timestamp));
}

export function getPlannerStatus(hour: number): PlannerStatus {
  if (hour >= 9 && hour < 17) {
    return "ideal";
  }

  if (hour >= 7 && hour < 9) {
    return "early";
  }

  if (hour >= 17 && hour < 22) {
    return "late";
  }

  return "overnight";
}

export function getPlannerStatusLabel(status: PlannerStatus) {
  switch (status) {
    case "ideal":
      return "Workday";
    case "early":
      return "Early";
    case "late":
      return "Late";
    default:
      return "Overnight";
  }
}

export function getPlannerStatusClasses(status: PlannerStatus) {
  switch (status) {
    case "ideal":
      return "border-emerald-300/26 bg-emerald-300/12 text-emerald-100";
    case "early":
      return "border-cyan-300/24 bg-cyan-300/12 text-cyan-100";
    case "late":
      return "border-amber-300/24 bg-amber-300/12 text-amber-100";
    default:
      return "border-rose-300/24 bg-rose-300/12 text-rose-100";
  }
}

export function buildPlannerSummary(
  cities: ClockTimeZoneOption[],
  plannerTimestamp: number,
  use24Hour: boolean,
  browserTimeZone: string,
  getCityHour: (timeZone: string, tick: number) => number,
) {
  const intro = `Clock planner for ${formatPlannerTimeLabel(browserTimeZone, plannerTimestamp, use24Hour)} (${browserTimeZone})`;
  const lines = cities.map((city) => {
    const hour = getCityHour(city.timeZone, plannerTimestamp);
    const status = getPlannerStatusLabel(getPlannerStatus(hour));
    const label = formatPlannerTimeLabel(city.timeZone, plannerTimestamp, use24Hour);

    return `${city.city}: ${label} · ${status}`;
  });

  return [intro, ...lines].join("\n");
}

export function createTimePlaceholder(use24Hour: boolean) {
  return use24Hour ? "--:--:--" : "--:--:-- --";
}

export function createInitialPlannerValue() {
  return "";
}

export function createNowPlannerValue() {
  return buildPlannerInputValue(Date.now());
}
