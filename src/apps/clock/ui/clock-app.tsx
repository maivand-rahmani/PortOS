"use client";

import { useEffect, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { buildFormattedWorldClockTime } from "@/shared/lib/app-logic";

import { worldClocks } from "../model/content";

export function ClockApp({ processId }: AppComponentProps) {
  const [tick, setTick] = useState("000000");
  const [use24Hour, setUse24Hour] = useState(true);
  const [cities, setCities] = useState(() => [...worldClocks]);
  const [nextCityTimeZone, setNextCityTimeZone] = useState("");

  const remainingCities = worldClocks.filter(
    (candidate) => !cities.some((city) => city.timeZone === candidate.timeZone),
  );
  const selectedCityTimeZone =
    remainingCities.some((city) => city.timeZone === nextCityTimeZone)
      ? nextCityTimeZone
      : (remainingCities[0]?.timeZone ?? "");

  useEffect(() => {
    const updateTick = () => {
      setTick(String(Date.now()).slice(-6));
    };

    updateTick();

    const intervalId = window.setInterval(updateTick, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="clock-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <div className="rounded-[24px] bg-white/72 p-4 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-700/60">Clock</p>
            <p className="mt-2 text-sm text-slate-900/60">Live sync token {tick} / {processId.slice(0, 4)}</p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <button
              type="button"
              onClick={() => setUse24Hour((current) => !current)}
              className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition duration-200 hover:border-slate-400"
            >
              {use24Hour ? "Switch to 12h" : "Switch to 24h"}
            </button>
            <div className="flex items-center gap-2">
              <select
                value={selectedCityTimeZone}
                onChange={(event) => setNextCityTimeZone(event.target.value)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-400/60"
                disabled={remainingCities.length === 0}
              >
                {remainingCities.length > 0 ? (
                  <>
                    <option value="">Select city</option>
                    {remainingCities.map((city) => (
                      <option key={city.timeZone} value={city.timeZone}>
                        {city.city}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">All cities added</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!selectedCityTimeZone) {
                    return;
                  }

                  const nextCity =
                    remainingCities.find((city) => city.timeZone === selectedCityTimeZone) ??
                    remainingCities[0];

                  if (!nextCity) {
                    return;
                  }

                  setCities((current) => [...current, nextCity]);

                  const upcoming = remainingCities.filter((city) => city.timeZone !== nextCity.timeZone);
                  setNextCityTimeZone(upcoming[0]?.timeZone ?? "");
                }}
                disabled={remainingCities.length === 0}
                className="cursor-pointer rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                Add city
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid flex-1 gap-4 md:grid-cols-2">
        {cities.map((item) => (
          <article key={item.timeZone} className="rounded-[24px] border border-slate-200 bg-white/75 p-5 shadow-panel">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-600">{item.city}</p>
            <p className="mt-4 font-display text-4xl font-semibold text-slate-950">{buildFormattedWorldClockTime(item.timeZone, use24Hour)}</p>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600">
              <span>{item.timeZone}</span>
              <button
                type="button"
                onClick={() => {
                  const nextCities = cities.filter((city) => city.timeZone !== item.timeZone);
                  const refreshedOptions = worldClocks.filter(
                    (candidate) => !nextCities.some((city) => city.timeZone === candidate.timeZone),
                  );

                  setCities(nextCities);
                  setNextCityTimeZone(refreshedOptions[0]?.timeZone ?? "");
                }}
                className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition duration-200 hover:bg-slate-100"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
