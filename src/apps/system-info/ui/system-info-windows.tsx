import { AppWindow } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { cn } from "@/shared/lib";

import type { RuntimeWindowRow } from "../model/types";
import { LegendRow, NewsTooltip, ProcessMeta, SectionHeader } from "./system-info-primitives";

const WINDOW_STATE_COLORS: Record<string, string> = {
  Visible: "#111111",
  Minimized: "#9ca3af",
  Maximized: "#cc0000",
};

export function SystemInfoWindows({ windowRows }: { windowRows: RuntimeWindowRow[] }) {
  return (
    <section>
      <SectionHeader title="Windows" icon={AppWindow} meta="Window Ledger" />
      <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="border-b border-[#111111] px-4 py-4 xl:border-b-0 xl:border-r">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={windowRows.map((window) => ({
                  name: window.title.length > 14 ? `${window.title.slice(0, 14)}...` : window.title,
                  zIndex: window.zIndex,
                }))}
                margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
              >
                <CartesianGrid stroke="#d4d4d4" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#737373" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} width={28} />
                <Tooltip content={<NewsTooltip />} cursor={{ fill: "rgba(17,17,17,0.04)" }} />
                <Bar dataKey="zIndex">
                  {windowRows.map((window) => (
                    <Cell key={window.id} fill={WINDOW_STATE_COLORS[window.state] ?? "#111111"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <LegendRow items={Object.entries(WINDOW_STATE_COLORS).map(([label, color]) => ({ label, color }))} />
        </div>

        <div>
          {windowRows.map((window, index) => (
            <div
              key={window.id}
              className={cn(
                "grid border-b border-[#111111] last:border-b-0 md:grid-cols-[minmax(0,1fr)_140px]",
                index % 2 === 0 ? "bg-[#f9f9f7]" : "bg-[#f5f5f5]",
              )}
            >
              <div className="border-r border-[#111111] px-4 py-4">
                <p className="font-serif text-xl font-bold leading-tight">{window.title}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-[#737373]">{window.appId}</p>
                <p className="mt-3 inline-flex border border-[#111111] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#737373]">
                  {window.isFocused ? "Frontmost" : "Queued"}
                </p>
              </div>
              <div className="px-4 py-4">
                <ProcessMeta label="State" value={window.state} />
                <ProcessMeta label="Size" value={window.sizeLabel} className="mt-4" />
                <ProcessMeta label="Z-Index" value={String(window.zIndex)} className="mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
