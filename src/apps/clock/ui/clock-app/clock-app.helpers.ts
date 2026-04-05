import type { ClockTimeZoneOption } from "../../model/content";
import { buildPlannerInputValue } from "../../model/time";
import { PERSISTED_FILE_PATHS, subscribeToFileSystemChanges } from "@/shared/lib";
import { readJsonAtPath, writeJsonAtPath } from "@/shared/lib/fs-actions";

const CLOCK_STORAGE_EVENT = "portos:clock-storage-change";

type ClockPreferences = {
  favorites: string[];
  favoriteOrder: string[];
};

export type PlannerStatus = "ideal" | "early" | "late" | "overnight";

function normalizeClockPreferences(value: ClockPreferences | null): ClockPreferences {
  return {
    favorites: Array.isArray(value?.favorites) ? value.favorites : [],
    favoriteOrder: Array.isArray(value?.favoriteOrder) ? value.favoriteOrder : [],
  };
}

async function readClockPreferences() {
  const stored = await readJsonAtPath<ClockPreferences>(
    PERSISTED_FILE_PATHS.clockPreferences,
  );

  return normalizeClockPreferences(stored);
}

async function writeClockPreferences(preferences: ClockPreferences) {
  await writeJsonAtPath(PERSISTED_FILE_PATHS.clockPreferences, preferences);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CLOCK_STORAGE_EVENT));
  }
}

export async function readFavoriteTimeZones() {
  const preferences = await readClockPreferences();

  return new Set(preferences.favorites);
}

export async function saveFavoriteTimeZones(favorites: Set<string>) {
  const current = await readClockPreferences();

  await writeClockPreferences({
    ...current,
    favorites: [...favorites],
  });
}

export async function readFavoriteOrder() {
  const preferences = await readClockPreferences();

  return preferences.favoriteOrder;
}

export async function saveFavoriteOrder(order: string[]) {
  const current = await readClockPreferences();

  await writeClockPreferences({
    ...current,
    favoriteOrder: order,
  });
}

export function subscribeToClockStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(CLOCK_STORAGE_EVENT, onStoreChange);
  const unsubscribeFs = subscribeToFileSystemChanges((detail) => {
    if (detail.path === PERSISTED_FILE_PATHS.clockPreferences) {
      onStoreChange();
    }
  });

  return () => {
    window.removeEventListener(CLOCK_STORAGE_EVENT, onStoreChange);
    unsubscribeFs();
  };
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
