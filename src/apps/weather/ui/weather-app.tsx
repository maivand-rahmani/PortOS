"use client";

import { useEffect, useState } from "react";

import type { AppComponentProps } from "@/entities/app";

type WeatherResponse = {
  weather: {
    city: string;
    temperature: number;
    wind: number;
    condition: string;
    updatedAt: string;
  };
};

export function WeatherApp({ processId }: AppComponentProps) {
  const [city, setCity] = useState("Berlin");
  const [data, setData] = useState<WeatherResponse["weather"] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const payload = (await response.json()) as WeatherResponse;

      if (!cancelled) {
        setData(payload.weather);
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <div className="weather-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <div className="rounded-[24px] bg-white/75 p-4 shadow-panel">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-sky-700/60">Weather</p>
            <p className="mt-2 text-sm text-sky-950/60">Forecast token {processId.slice(0, 6)}</p>
          </div>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm text-sky-950 outline-none focus:ring-2 focus:ring-sky-400/60"
          />
        </div>
      </div>
      <div className="grid flex-1 gap-4 md:grid-cols-3">
        <article className="rounded-[24px] bg-white/75 p-5 shadow-panel md:col-span-2">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-700/60">{data?.city ?? city}</p>
          <p className="mt-4 font-display text-5xl font-semibold text-sky-950">{data ? `${data.temperature}deg` : "--"}</p>
          <p className="mt-3 text-base text-sky-900/70">{data?.condition ?? "Loading..."}</p>
        </article>
        <article className="rounded-[24px] bg-white/75 p-5 shadow-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-700/60">Wind</p>
          <p className="mt-4 text-3xl font-semibold text-sky-950">{data ? `${data.wind} km/h` : "--"}</p>
          <p className="mt-4 text-sm text-sky-900/60">Updated {data ? new Date(data.updatedAt).toLocaleTimeString() : "..."}</p>
        </article>
      </div>
    </div>
  );
}
