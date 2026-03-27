"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import {
  Activity,
  AppWindow,
  Eye,
  PieChart as PieChartIcon,
  Power,
  Radar,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import { terminateProcessById } from "@/shared/lib";
import { cn } from "@/shared/lib";

import {
  buildSystemInfoContent,
  type RuntimeMeter,
  type RuntimeProcessRow,
} from "../model/content";

const WINDOW_STATE_COLORS: Record<string, string> = {
  Visible: "#111111",
  Minimized: "#9ca3af",
  Maximized: "#cc0000",
};

const DISTRIBUTION_COLORS = ["#111111", "#cc0000", "#737373"];

export function SystemInfoApp({ processId }: AppComponentProps) {
  const apps = useOSStore((state) => state.apps);
  const processes = useOSStore((state) => state.processes);
  const windows = useOSStore((state) => state.windows);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const bootProgress = useOSStore((state) => state.bootProgress);

  const content = useMemo(
    () =>
      buildSystemInfoContent({
        apps,
        processes,
        windows,
        activeWindowId,
        bootProgress,
      }),
    [activeWindowId, apps, bootProgress, processes, windows],
  );

  const [selectedProcessId, setSelectedProcessId] = useState(content.processRows[0]?.id ?? "");

  const selectedProcess =
    content.processRows.find((process) => process.id === selectedProcessId) ?? content.processRows[0] ?? null;
  const selectedWindow =
    content.windowRows.find((window) => window.processId === selectedProcess?.id) ?? null;

  return (
    <div className="system-info-app system-info-texture flex h-full min-h-0 flex-col bg-[#f9f9f7] text-[#111111]">
      <header className="shrink-0 border-b-4 border-[#111111] px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_380px] lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#737373]">
              Vol. 1 | Runtime Desk | Session {processId.slice(0, 6).toUpperCase()}
            </p>
            <h1 className="mt-3 font-serif text-5xl font-black leading-[0.92] tracking-tighter sm:text-6xl lg:text-7xl">
              System Info
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#404040] sm:text-base">
              A structured runtime monitor for PortOS with separate sections, readable charts, a clear process list, and a selected-process detail view.
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="min-h-full space-y-0">
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

          <section className="border-b border-[#111111]">
            <SectionHeader title="Processes" icon={Power} meta="Select A Process" />
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_420px]">
              <div className="border-b border-[#111111] xl:border-b-0 xl:border-r">
                {content.processRows.length > 0 ? (
                  content.processRows.map((process, index) => {
                    const isSelected = process.id === selectedProcess?.id;

                    return (
                      <button
                        key={process.id}
                        type="button"
                        onClick={() => setSelectedProcessId(process.id)}
                        className={cn(
                          "grid w-full cursor-pointer border-b border-[#111111] text-left transition-colors duration-200 last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_170px_130px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-inset",
                          isSelected ? "bg-[#111111] text-[#f9f9f7]" : index % 2 === 0 ? "bg-[#f9f9f7] hover:bg-[#f5f5f5]" : "bg-[#f5f5f5] hover:bg-[#ecece8]",
                        )}
                      >
                        <SelectableCell inverted={isSelected} className="border-r border-[#111111] px-4 py-4">
                          <p className="font-serif text-2xl font-bold leading-tight">{process.name}</p>
                          <p className={cn("mt-1 font-mono text-xs uppercase tracking-[0.18em]", isSelected ? "text-[#d4d4d4]" : "text-[#737373]")}>
                            {process.appId}
                          </p>
                          <p className={cn("mt-3 text-sm leading-6", isSelected ? "text-[#f5f5f5]" : "text-[#404040]")}>
                            {process.windowTitle}
                          </p>
                        </SelectableCell>

                        <SelectableCell inverted={isSelected} className="border-r border-[#111111] px-4 py-4">
                          <ProcessMeta label="State" value={process.windowState} inverted={isSelected} />
                          <ProcessMeta label="Started" value={process.startedLabel} inverted={isSelected} className="mt-4" />
                        </SelectableCell>

                        <SelectableCell inverted={isSelected} className="px-4 py-4">
                          <ProcessMeta label="Uptime" value={process.uptimeLabel} inverted={isSelected} />
                          <div className="mt-4 inline-flex border border-[#111111] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                            {process.isFocused ? "Focused" : "Background"}
                          </div>
                        </SelectableCell>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-4 text-sm leading-7 text-[#404040]">No active processes.</div>
                )}
              </div>

              <aside className="min-h-0">
                <SectionHeader title="Selected Process" icon={Eye} meta="Detail Panel" />
                {selectedProcess ? (
                  <div>
                    <DetailBlock title="Identity">
                      <DetailRow label="Name" value={selectedProcess.name} />
                      <DetailRow label="App ID" value={selectedProcess.appId} />
                      <DetailRow label="Window" value={selectedProcess.windowTitle} />
                    </DetailBlock>

                    <DetailBlock title="Runtime State">
                      <DetailRow label="Window State" value={selectedProcess.windowState} />
                      <DetailRow label="Started" value={selectedProcess.startedLabel} />
                      <DetailRow label="Uptime" value={selectedProcess.uptimeLabel} />
                      <DetailRow label="Focused" value={selectedProcess.isFocused ? "Yes" : "No"} />
                    </DetailBlock>

                    <DetailBlock title="Window Context">
                      <DetailRow label="Visible State" value={selectedWindow?.state ?? "No Window"} />
                      <DetailRow label="Size" value={selectedWindow?.sizeLabel ?? "-"} />
                      <DetailRow label="Z-Index" value={selectedWindow ? String(selectedWindow.zIndex) : "-"} />
                    </DetailBlock>

                    <div className="border-t border-[#111111] px-4 py-4">
                      {selectedProcess.isKillable ? (
                        <button
                          type="button"
                          onClick={() => terminateProcessById(selectedProcess.id)}
                          className="min-h-[44px] w-full border border-[#111111] bg-[#111111] px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f9f9f7] transition-all duration-200 hover:bg-white hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
                        >
                          Terminate Selected Process
                        </button>
                      ) : (
                        <div className="border border-[#111111] px-3 py-3 font-mono text-xs uppercase tracking-[0.16em] text-[#737373]">
                          System Info is protected from self-termination.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm leading-7 text-[#404040]">No running process selected.</div>
                )}
              </aside>
            </div>
          </section>

          <section>
            <SectionHeader title="Windows" icon={AppWindow} meta="Window Ledger" />
            <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)]">
              <div className="border-b border-[#111111] px-4 py-4 xl:border-b-0 xl:border-r">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={content.windowRows.map((window) => ({
                        name: window.title.length > 14 ? `${window.title.slice(0, 14)}…` : window.title,
                        zIndex: window.zIndex,
                      }))}
                      margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#d4d4d4" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#737373" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} width={28} />
                      <Tooltip content={<NewsTooltip />} cursor={{ fill: "rgba(17,17,17,0.04)" }} />
                      <Bar dataKey="zIndex">
                        {content.windowRows.map((window) => (
                          <Cell key={window.id} fill={WINDOW_STATE_COLORS[window.state] ?? "#111111"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <LegendRow
                  items={Object.entries(WINDOW_STATE_COLORS).map(([label, color]) => ({ label, color }))}
                />
              </div>

              <div>
                {content.windowRows.map((window, index) => (
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
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  meta,
}: {
  title: string;
  icon: typeof Activity;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#111111] bg-[#f9f9f7] px-4 py-3">
      <div className="flex h-11 w-11 items-center justify-center border border-[#111111]">
        <Icon className="h-5 w-5 text-[#111111]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#737373]">{meta}</p>
        <h2 className="font-serif text-3xl font-bold leading-none">{title}</h2>
      </div>
    </div>
  );
}

function MeterCard({ meter, isLast }: { meter: RuntimeMeter; isLast: boolean }) {
  return (
    <div className={cn("border-b border-[#111111] md:border-b-0", !isLast && "md:border-r")}>
      <div className="px-4 py-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#737373]">{meter.label}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="font-serif text-5xl font-black leading-none tracking-tighter">{meter.displayValue}</p>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#737373]">Live</span>
        </div>
        <div className="mt-4 h-4 border border-[#111111] bg-[#e5e5e0]">
          <div className="h-full bg-[#111111]" style={{ width: `${meter.value}%` }} />
        </div>
        <p className="mt-4 text-sm leading-7 text-[#404040]">{meter.note}</p>
      </div>
    </div>
  );
}

function ChartPanel({
  title,
  icon: Icon,
  meta,
  children,
}: {
  title: string;
  icon: typeof Activity;
  meta: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[#111111] xl:border-b-0 xl:border-r last:border-r-0">
      <SectionHeader title={title} icon={Icon} meta={meta} />
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-[#111111] px-4 py-4 last:border-b-0">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#737373]">{title}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#737373]">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#111111]">{value}</p>
    </div>
  );
}

function CompactFact({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: string;
  inverted?: boolean;
}) {
  return (
    <div>
      <p className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", inverted ? "text-[#a3a3a3]" : "text-[#737373]")}>
        {label}
      </p>
      <p className="mt-1 font-serif text-lg font-bold leading-tight">{value}</p>
    </div>
  );
}

function LegendRow({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3 border-t border-[#111111] pt-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="h-3 w-3 border border-[#111111]" style={{ backgroundColor: item.color }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#737373]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ProcessMeta({
  label,
  value,
  inverted = false,
  className,
}: {
  label: string;
  value: string;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", inverted ? "text-[#d4d4d4]" : "text-[#737373]")}>
        {label}
      </p>
      <p className={cn("mt-1 text-sm font-semibold leading-6", inverted ? "text-[#f9f9f7]" : "text-[#111111]")}>
        {value}
      </p>
    </div>
  );
}

function SelectableCell({
  inverted,
  className,
  children,
}: {
  inverted: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(className, inverted && "text-[#f9f9f7]")}>{children}</div>;
}

function NewsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; name?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="border border-[#111111] bg-[#f9f9f7] px-3 py-2 text-sm shadow-none">
      {label ? <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#737373]">{label}</p> : null}
      <div className="mt-2 space-y-1">
        {payload.map((entry, index) => (
          <p key={`${entry.name ?? "value"}-${index}`} className="text-sm text-[#111111]">
            <span className="font-semibold">{entry.name ?? "Value"}:</span> {String(entry.value ?? "-")}
          </p>
        ))}
      </div>
    </div>
  );
}
