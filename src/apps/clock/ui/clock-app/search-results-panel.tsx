import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";

import { cn } from "@/shared/lib";

import type { ClockTimeZoneOption } from "../../model/content";

export function SearchResultsPanel({
  filteredResults,
  favoriteTimeZones,
  reduceMotion,
  searchQuery,
  onAdd,
  onToggleFavorite,
}: {
  filteredResults: ClockTimeZoneOption[];
  favoriteTimeZones: Set<string>;
  reduceMotion: boolean | null;
  searchQuery: string;
  onAdd: (option: ClockTimeZoneOption) => void;
  onToggleFavorite: (timeZone: string) => void;
}) {
  return (
    <section className="clock-app__sidebar flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] p-3">
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
                onAdd={() => onAdd(option)}
                onToggleFavorite={() => onToggleFavorite(option.timeZone)}
              />
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-white/12 bg-white/5 px-4 py-8 text-center text-sm text-slate-300/62">
              {searchQuery.trim() ? "No results" : "Search or save favorites"}
            </div>
          )}
        </div>
      </div>
    </section>
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
