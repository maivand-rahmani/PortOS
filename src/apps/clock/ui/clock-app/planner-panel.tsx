import { Copy, Target } from "lucide-react";

import type { ClockTimeZoneOption } from "../../model/content";
import type { PlannerStatus } from "./clock-app.helpers";
import { getPlannerStatusClasses, getPlannerStatusLabel } from "./clock-app.helpers";

type PlannerRowData = {
  city: ClockTimeZoneOption;
  timeLabel: string;
  comparisonLabel: string;
  status: PlannerStatus;
};

export function PlannerPanel({
  plannerValue,
  browserTimeZone,
  copyStatus,
  plannerRows,
  spotlightTimeZone,
  onCopy,
  onChangePlannerValue,
  onShiftHours,
  onSetNow,
  onSetTomorrowMorning,
  onSpotlight,
}: {
  plannerValue: string;
  browserTimeZone: string;
  copyStatus: "idle" | "copied" | "unsupported";
  plannerRows: PlannerRowData[];
  spotlightTimeZone: string;
  onCopy: () => void;
  onChangePlannerValue: (value: string) => void;
  onShiftHours: (hours: number) => void;
  onSetNow: () => void;
  onSetTomorrowMorning: () => void;
  onSpotlight: (timeZone: string) => void;
}) {
  return (
    <section className="clock-app__sidebar flex flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-3 px-1 pb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-200/52">Meeting Planner</p>
          <p className="mt-1 text-xs text-slate-300/52">Draft a moment in your timezone and inspect every tracked city.</p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/8 text-slate-100 transition duration-200 hover:border-cyan-300/40 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
          aria-label="Copy planner summary"
        >
          <Copy className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>

      <label className="rounded-[20px] border border-white/10 bg-slate-950/50 px-4 py-3 text-xs text-slate-300/54">
        Local planning time
        <input
          type="datetime-local"
          value={plannerValue}
          onChange={(event) => onChangePlannerValue(event.target.value)}
          className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { label: "-3h", hours: -3 },
          { label: "+3h", hours: 3 },
          { label: "+8h", hours: 8 },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onShiftHours(item.hours)}
            className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full border border-white/10 bg-white/8 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition duration-200 hover:border-cyan-300/40 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onSetNow}
          className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full border border-white/10 bg-white/8 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition duration-200 hover:border-cyan-300/40 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
        >
          Now
        </button>
        <button
          type="button"
          onClick={onSetTomorrowMorning}
          className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full border border-cyan-300/18 bg-cyan-300/12 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
        >
          Tomorrow 09:00
        </button>
      </div>

      <div className="mt-3 rounded-[18px] border border-white/10 bg-slate-950/36 px-3 py-2 text-xs text-slate-300/56">
        {copyStatus === "copied"
          ? "Planner summary copied."
          : copyStatus === "unsupported"
            ? "Clipboard is unavailable in this browser context."
            : `Using ${browserTimeZone} as the planner baseline.`}
      </div>

      <div className="mt-3 min-h-0 space-y-2 overflow-auto pr-1">
        {plannerRows.map((row) => (
          <PlannerRow
            key={row.city.timeZone}
            city={row.city}
            timeLabel={row.timeLabel}
            comparisonLabel={row.comparisonLabel}
            status={row.status}
            isSpotlight={row.city.timeZone === spotlightTimeZone}
            onSpotlight={() => onSpotlight(row.city.timeZone)}
          />
        ))}
      </div>
    </section>
  );
}

function PlannerRow({
  city,
  timeLabel,
  comparisonLabel,
  status,
  isSpotlight,
  onSpotlight,
}: {
  city: ClockTimeZoneOption;
  timeLabel: string;
  comparisonLabel: string;
  status: PlannerStatus;
  isSpotlight: boolean;
  onSpotlight: () => void;
}) {
  return (
    <div className={isSpotlight ? "rounded-[18px] border border-cyan-300/24 bg-cyan-300/10 p-3" : "rounded-[18px] border border-white/10 bg-white/6 p-3"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{city.city}</p>
          <p className="mt-1 truncate text-xs text-slate-300/52">{timeLabel}</p>
          <p className="mt-1 truncate text-xs text-slate-400">{comparisonLabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${getPlannerStatusClasses(status)}`}>
            {getPlannerStatusLabel(status)}
          </span>
          <button
            type="button"
            onClick={onSpotlight}
            className="inline-flex min-h-[32px] min-w-[32px] cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/8 text-slate-100 transition duration-200 hover:border-cyan-300/44 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
            aria-label={`Spotlight ${city.city}`}
          >
            <Target className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
