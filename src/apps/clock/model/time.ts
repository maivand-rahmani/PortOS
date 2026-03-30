import type { ClockTimeZoneOption } from "./content";

function readTimeParts(timeZone: string, tick: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(new Date(tick));

  const lookup = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: lookup("year"),
    month: lookup("month"),
    day: lookup("day"),
    hours: lookup("hour"),
    minutes: lookup("minute"),
    seconds: lookup("second"),
  };
}

function formatSignedHourDelta(totalMinutes: number) {
  if (totalMinutes === 0) {
    return "Same time";
  }

  const sign = totalMinutes > 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  if (minutes === 0) {
    return `${sign}${hours}h`;
  }

  return `${sign}${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function getClockHour(timeZone: string, tick: number) {
  return readTimeParts(timeZone, tick).hours;
}

export function getClockDate(timeZone: string, tick: number) {
  const { hours, minutes, seconds } = readTimeParts(timeZone, tick);

  return {
    hours,
    minutes,
    seconds,
  };
}

export function buildCompactLabel(timeZone: string, countryName: string) {
  if (timeZone === "UTC") {
    return "UTC";
  }

  return countryName;
}

export function sortByFavoriteOrder(options: ClockTimeZoneOption[], favoriteOrder: string[]) {
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

export function buildClockComparisonLabel(timeZone: string, referenceTimeZone: string, tick: number) {
  const target = readTimeParts(timeZone, tick);
  const reference = readTimeParts(referenceTimeZone, tick);
  const targetDay = Date.UTC(target.year, target.month - 1, target.day) / 86400000;
  const referenceDay = Date.UTC(reference.year, reference.month - 1, reference.day) / 86400000;
  const dayDelta = targetDay - referenceDay;
  const minuteDelta = dayDelta * 1440 + (target.hours * 60 + target.minutes) - (reference.hours * 60 + reference.minutes);
  const labels: string[] = [];

  if (dayDelta === -1) {
    labels.push("Yesterday");
  } else if (dayDelta === 1) {
    labels.push("Tomorrow");
  }

  labels.push(`${formatSignedHourDelta(minuteDelta)} vs local`);

  return labels.join(" · ");
}

export function buildPlannerInputValue(timestamp: number) {
  const value = new Date(timestamp);
  const pad = (input: number) => String(input).padStart(2, "0");

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function shiftPlannerDateTime(value: string, hourDelta: number) {
  const currentTimestamp = Date.parse(value);

  if (Number.isNaN(currentTimestamp)) {
    return buildPlannerInputValue(Date.now() + hourDelta * 3600000);
  }

  return buildPlannerInputValue(currentTimestamp + hourDelta * 3600000);
}

export function buildTomorrowMorningPlannerValue() {
  const next = new Date();

  next.setDate(next.getDate() + 1);
  next.setHours(9, 0, 0, 0);

  return buildPlannerInputValue(next.getTime());
}
