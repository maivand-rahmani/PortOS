import { Activity, PieChart as PieChartIcon, Radar } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SystemInfoContent } from "../model/types";
import { ChartPanel, CompactFact, LegendRow, MeterCard, NewsTooltip, SectionHeader } from "./system-info-primitives";

const DISTRIBUTION_COLORS = ["#111111", "#cc0000", "#737373"];

export function SystemInfoOverview({
  content,
  bootProgress,
  processId,
}: {
  content: SystemInfoContent;
  bootProgress: number;
  processId: string;
}) {
  return (
    <>
      <header className="shrink-0 border-b-4 border-[#111111] px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_380px] lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#737373]">
              {content.editionLabel} | Session {processId.slice(0, 6).toUpperCase()}
            </p>
            <h1 className="mt-3 font-serif text-5xl font-black leading-[0.92] tracking-tighter sm:text-6xl lg:text-7xl">
              System Info
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#404040] sm:text-base">
              Actionable runtime monitoring for PortOS with process spotlighting, incident export, and operator handoff into Terminal and Notes.
            </p>
          </div>

          <div className="border border-[#111111] bg-[#111111] px-4 py-4 text-[#f9f9f7]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <CompactFact label="Focused Window" value={content.headlineStats.focusedWindowTitle} inverted />
              <CompactFact label="Running Processes" value={String(content.headlineStats.processCount)} inverted />
              <CompactFact label="Visible Windows" value={String(content.headlineStats.visibleWindowCount)} inverted />
              <CompactFact label="Boot Progress" value={`${bootProgress}%`} inverted />
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-[#111111]">
        <div className="grid md:grid-cols-3">
          {content.meters.map((meter, index) => (
            <MeterCard key={meter.label} meter={meter} isLast={index === content.meters.length - 1} />
          ))}
        </div>
      </section>

      <section className="border-b border-[#111111]">
        <SectionHeader title="Charts" icon={Activity} meta="Runtime Overview" />
        <div className="grid grid-cols-1 xl:grid-cols-2">
          <ChartPanel title="Runtime Load" icon={Radar} meta="CPU / Memory">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={content.cpuTrend.map((point, index) => ({
                    label: point.label,
                    cpu: point.value,
                    memory: content.memoryTrend[index]?.value ?? point.value,
                  }))}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="system-info-cpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111111" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="system-info-memory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cc0000" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#cc0000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#d4d4d4" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} width={28} />
                  <Tooltip content={<NewsTooltip />} cursor={{ stroke: "#111111", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="cpu" stroke="#111111" strokeWidth={2} fill="url(#system-info-cpu)" />
                  <Area type="monotone" dataKey="memory" stroke="#cc0000" strokeWidth={2} fill="url(#system-info-memory)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <LegendRow items={[{ label: "CPU", color: "#111111" }, { label: "Memory", color: "#cc0000" }]} />
          </ChartPanel>

          <ChartPanel title="Window Distribution" icon={PieChartIcon} meta="Layout State">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={content.windowDistribution}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={92}
                    paddingAngle={2}
                    stroke="#111111"
                    strokeWidth={1}
                  >
                    {content.windowDistribution.map((entry, index) => (
                      <Cell key={entry.label} fill={DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<NewsTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <LegendRow
              items={content.windowDistribution.map((entry, index) => ({
                label: `${entry.label} (${entry.value})`,
                color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
              }))}
            />
          </ChartPanel>
        </div>
      </section>
    </>
  );
}
