import { getTimeZones } from "@vvo/tzdb";

const DEFAULT_TIME_ZONES = [
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Tokyo",
  "America/New_York",
] as const;

export type ClockTimeZoneOption = {
  city: string;
  timeZone: string;
  countryName: string;
  countryCode: string;
  continentName: string;
  offsetLabel: string;
  searchLabel: string;
};

function buildOffsetLabel(offsetInMinutes: number) {
  const sign = offsetInMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetInMinutes);
  const hours = Math.floor(absoluteMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");

  return `UTC${sign}${hours}:${minutes}`;
}

function buildCityLabel(mainCities: string[], fallbackName: string) {
  return mainCities[0] ?? fallbackName.split("/").pop()?.replace(/_/g, " ") ?? fallbackName;
}

export function getClockTimeZoneOptions(): ClockTimeZoneOption[] {
  return getTimeZones({ includeUtc: true })
    .map((timeZone) => {
      const city = buildCityLabel(timeZone.mainCities, timeZone.name);
      const searchLabel = [
        city,
        timeZone.name,
        timeZone.countryName,
        timeZone.continentName,
        ...timeZone.mainCities,
        timeZone.alternativeName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return {
        city,
        timeZone: timeZone.name,
        countryName: timeZone.countryName || "Global",
        countryCode: timeZone.countryCode || "--",
        continentName: timeZone.continentName || "Global",
        offsetLabel: buildOffsetLabel(timeZone.currentTimeOffsetInMinutes),
        searchLabel,
      } satisfies ClockTimeZoneOption;
    })
    .sort((left, right) => {
      if (left.city !== right.city) {
        return left.city.localeCompare(right.city);
      }

      return left.timeZone.localeCompare(right.timeZone);
    });
}

export function getDefaultClockTimeZones(options: ClockTimeZoneOption[]) {
  return DEFAULT_TIME_ZONES.map((timeZone) => options.find((option) => option.timeZone === timeZone)).filter(Boolean) as ClockTimeZoneOption[];
}
