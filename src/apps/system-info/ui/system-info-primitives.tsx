import type { ReactNode } from "react";

import { Activity } from "lucide-react";

import { cn } from "@/shared/lib";

export function SectionHeader({
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

export function MeterCard({ meter, isLast }: { meter: { label: string; displayValue: string; value: number; note: string }; isLast: boolean }) {
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

export function ChartPanel({
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

export function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-[#111111] px-4 py-4 last:border-b-0">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#737373]">{title}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#737373]">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#111111]">{value}</p>
    </div>
  );
}

export function CompactFact({
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

export function LegendRow({ items }: { items: Array<{ label: string; color: string }> }) {
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

export function ProcessMeta({
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
      <p className={cn("mt-1 text-sm font-semibold leading-6", inverted ? "text-[#f9f9f7]" : "text-[#111111]")}>{value}</p>
    </div>
  );
}

export function SelectableCell({
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

export function NewsTooltip({
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

export function ActionButton({
  label,
  onClick,
  tone = "light",
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  tone?: "light" | "dark";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-h-[44px] border px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2",
        tone === "dark"
          ? "border-[#111111] bg-[#111111] text-[#f9f9f7] hover:bg-white hover:text-[#111111] disabled:hover:bg-[#111111] disabled:hover:text-[#f9f9f7]"
          : "border-[#111111] bg-[#f9f9f7] text-[#111111] hover:bg-[#111111] hover:text-[#f9f9f7]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {label}
    </button>
  );
}
