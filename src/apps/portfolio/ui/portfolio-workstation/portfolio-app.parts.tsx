import type { ReactNode } from "react";

import { type LucideIcon } from "lucide-react";
import Image from "next/image";

import { cn, type PortfolioHandoffTarget } from "@/shared/lib";

import type { PortfolioProject } from "../../model/content";
import type { PortfolioProjectHandoff } from "../../model/handoffs";

export function Panel({
  title,
  icon: Icon,
  meta,
  children,
  elevated = false,
  bolted = false,
}: {
  title: string;
  icon: LucideIcon;
  meta?: string;
  children: ReactNode;
  elevated?: boolean;
  bolted?: boolean;
}) {
  return (
    <section
      className={cn(
        "industrial-panel rounded-[28px]",
        elevated && "industrial-panel--floating",
        bolted && "industrial-bolted",
      )}
    >
      <div className="industrial-panel-header">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] shadow-[var(--industrial-shadow-floating)]">
            <Icon className="h-5 w-5 text-[#ff4757]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="industrial-label">module</p>
            <h3 className="truncate text-lg font-semibold text-[#2d3436]">{title}</h3>
          </div>
        </div>
        {meta ? <span className="industrial-chip industrial-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">{meta}</span> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function MetricCard({ label, value, tone }: { label: string; value: string; tone: "live" | "accent" | "warn" }) {
  const ledClass = tone === "live" ? "industrial-led--live" : tone === "warn" ? "industrial-led--warn" : "industrial-led";

  return (
    <div className="industrial-panel industrial-bolted rounded-[20px] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="industrial-label">{label}</p>
        <span className={cn("industrial-led animate-pulse", ledClass)} aria-hidden="true" />
      </div>
      <p className="industrial-mono mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#2d3436]">{value}</p>
    </div>
  );
}

export function TelemetryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="industrial-recessed rounded-[20px] p-4">
      <p className="industrial-label">{label}</p>
      <p className="industrial-mono mt-3 text-2xl font-semibold text-[#2d3436]">{value}</p>
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">{children}</span>;
}

export function DevicePreview({
  imageSrc,
  imageAlt,
  imageLabel,
  projectTitle,
  projectAccent,
  statusLabel,
}: {
  imageSrc: string;
  imageAlt: string;
  imageLabel: string;
  projectTitle: string;
  projectAccent: string;
  statusLabel: string;
}) {
  return (
    <div className="portfolio-device-glow rounded-[30px] bg-[#d1d9e6] p-3 shadow-[var(--industrial-shadow-floating)]">
      <div className="rounded-[28px] border border-[#475569]/20 bg-[#2d3436] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between px-2 pb-3">
          <div className="flex items-center gap-2">
            <span className="industrial-led industrial-led--live animate-pulse" aria-hidden="true" />
            <span className="industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#e0e5ec]">system operational</span>
          </div>
          <span className="industrial-mono text-[11px] uppercase tracking-[0.12em] text-[#a8b2d1]">{statusLabel}</span>
        </div>

        <div className="industrial-screen aspect-[4/5] rounded-[24px] border border-white/10">
          {imageSrc ? <Image src={imageSrc} alt={imageAlt} width={1200} height={1500} className="h-full w-full object-cover opacity-90" priority /> : null}
          <div className="absolute inset-x-4 top-4 rounded-[18px] bg-black/35 px-4 py-3 backdrop-blur-sm">
            <p className="industrial-mono text-[11px] uppercase tracking-[0.12em] text-[#a8b2d1]">active viewport</p>
            <p className="mt-1 text-sm font-semibold text-white">{projectTitle}</p>
          </div>
          <div className="absolute inset-x-4 bottom-4 space-y-3 rounded-[18px] bg-black/40 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.12em] text-[#e0e5ec]">
              <span>{imageLabel}</span>
              <span className="industrial-mono">preview</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[62, 84, 46].map((value, index) => (
                <div key={`${projectTitle}-${value}-${index}`} className="space-y-2 rounded-[14px] bg-white/6 p-2">
                  <p className="industrial-mono text-[10px] uppercase tracking-[0.12em] text-[#a8b2d1]">p0{index + 1}</p>
                  <div className="industrial-meter bg-white/10 shadow-none">
                    <span style={{ width: `${value}%`, background: `linear-gradient(90deg, ${projectAccent}, #ff9aa4)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyList({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="industrial-recessed overflow-hidden rounded-[20px]">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={cn(
            "grid grid-cols-[110px_minmax(0,1fr)] gap-3 border-b border-[#a3b1c6]/55 px-4 py-3 text-sm last:border-b-0",
            index % 2 === 0 ? "bg-white/25" : "bg-transparent",
          )}
        >
          <span className="industrial-label">{row.label}</span>
          <span className="leading-6 text-[#2d3436]">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function NumberedList({ items, accent }: { items: string[]; accent: "accent" | "neutral" }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="industrial-recessed rounded-[18px] p-4">
          <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-4">
            <div
              className={cn(
                "industrial-chip industrial-mono justify-center text-[11px] font-bold uppercase tracking-[0.12em]",
                accent === "accent" ? "bg-[#ff4757] text-white" : "text-[#4a5568]",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            <p className="text-sm leading-7 text-[#4a5568]">{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HandoffCard({
  handoff,
  isActive,
  onSelect,
}: {
  handoff: PortfolioProjectHandoff;
  isActive: boolean;
  onSelect: (handoffId: PortfolioHandoffTarget) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(handoff.id)}
      className={cn(
        "industrial-button industrial-bolted w-full flex-col items-start rounded-[18px] px-4 py-4 text-left",
        isActive ? "industrial-button-primary" : "text-[#2d3436]",
      )}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className={cn("industrial-label", isActive && "text-white/80")}>{handoff.outcomeLabel}</span>
        <span className={cn("industrial-chip industrial-mono text-[10px] font-bold uppercase tracking-[0.12em]", isActive ? "border-white/20 bg-white/15 text-white" : "text-[#4a5568]")}>{handoff.audience}</span>
      </div>
      <p className="mt-3 text-base font-semibold leading-6 normal-case tracking-normal">{handoff.label}</p>
      <p className={cn("mt-2 text-sm leading-6 normal-case tracking-normal", isActive ? "text-white/90" : "text-[#4a5568]")}>{handoff.summary}</p>
    </button>
  );
}

export function HandoffActionButton({
  label,
  helper,
  onClick,
  active = false,
}: {
  label: string;
  helper: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "industrial-button industrial-bolted w-full flex-col items-start rounded-[18px] px-4 py-4 text-left",
        active ? "industrial-button-primary" : "text-[#2d3436]",
      )}
    >
      <span className={cn("industrial-label", active && "text-white/80")}>handoff action</span>
      <span className="mt-2 text-sm font-semibold normal-case tracking-normal">{label}</span>
      <span className={cn("mt-2 text-sm leading-6 normal-case tracking-normal", active ? "text-white/90" : "text-[#4a5568]")}>{helper}</span>
    </button>
  );
}

export function HandoffSummary({ handoff, project }: { handoff: PortfolioProjectHandoff; project: PortfolioProject }) {
  return (
    <div className="industrial-recessed rounded-[24px] p-5">
      <div className="flex flex-wrap gap-3">
        <span className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">{handoff.audience}</span>
        <span className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">resume {handoff.recommendedResumeLens}</span>
        <span className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">section {handoff.recommendedResumeSection}</span>
      </div>
      <h4 className="mt-4 text-xl font-semibold text-[#2d3436]">
        {project.title} - {handoff.label}
      </h4>
      <p className="mt-3 text-sm leading-7 text-[#4a5568]">{handoff.summary}</p>
    </div>
  );
}
