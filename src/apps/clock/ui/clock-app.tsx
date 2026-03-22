"use client";

import { useEffect, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { buildWorldClockTime } from "@/shared/lib/app-logic";

import { worldClocks } from "../model/content";

export function ClockApp({ processId }: AppComponentProps) {
  const [tick, setTick] = useState("000000");

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
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-700/60">Clock</p>
        <p className="mt-2 text-sm text-slate-900/60">Live sync token {tick} / {processId.slice(0, 4)}</p>
      </div>
      <div className="grid flex-1 gap-4 md:grid-cols-2">
        {worldClocks.map((item) => (
          <article key={item.timeZone} className="rounded-[24px] border border-slate-200 bg-white/75 p-5 shadow-panel">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-600">{item.city}</p>
            <p className="mt-4 font-display text-4xl font-semibold text-slate-950">{buildWorldClockTime(item.timeZone)}</p>
            <p className="mt-2 text-sm text-slate-600">{item.timeZone}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
