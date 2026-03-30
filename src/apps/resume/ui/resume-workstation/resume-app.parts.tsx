import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { cn, type ResumeLensTarget } from "@/shared/lib";

import type { ResumeLens, ResumeQuickStat, ResumeSectionId, ResumeTimelineProject } from "../../model/content";

export function ResumeSection({
  id,
  title,
  icon: Icon,
  collapsed,
  onToggle,
  children,
  elevated = false,
}: {
  id: ResumeSectionId;
  title: string;
  icon: LucideIcon;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  elevated?: boolean;
}) {
  return (
    <section id={`resume-section-${id}`} className={cn("industrial-panel rounded-[28px]", elevated && "industrial-panel--floating", "industrial-bolted")}>
      <div className="industrial-panel-header">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] shadow-[var(--industrial-shadow-floating)]">
            <Icon className="h-5 w-5 text-[#ff4757]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="industrial-label">resume module</p>
            <h3 className="truncate text-lg font-semibold text-[#2d3436]">{title}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="industrial-button rounded-[14px] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em]"
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
      {!collapsed ? <div className="p-4 sm:p-5">{children}</div> : null}
    </section>
  );
}

export function DockPanel({
  title,
  icon: Icon,
  meta,
  children,
  elevated = false,
}: {
  title: string;
  icon: LucideIcon;
  meta?: string;
  children: ReactNode;
  elevated?: boolean;
}) {
  return (
    <section className={cn("industrial-panel rounded-[28px] industrial-bolted", elevated && "industrial-panel--floating")}>
      <div className="industrial-panel-header">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] shadow-[var(--industrial-shadow-floating)]">
            <Icon className="h-5 w-5 text-[#ff4757]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="industrial-label">side module</p>
            <h3 className="truncate text-lg font-semibold text-[#2d3436]">{title}</h3>
          </div>
        </div>
        {meta ? <span className="industrial-chip industrial-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">{meta}</span> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function MetricBadge({ label, value, tone }: { label: string; value: string; tone: "live" | "warn" | "accent" }) {
  const ledClass = tone === "live" ? "industrial-led--live" : tone === "warn" ? "industrial-led--warn" : "industrial-led";

  return (
    <div className="industrial-panel rounded-[20px] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="industrial-label">{label}</p>
        <span className={cn("industrial-led animate-pulse", ledClass)} aria-hidden="true" />
      </div>
      <p className="industrial-mono mt-3 text-lg font-semibold uppercase tracking-[0.02em] text-[#2d3436]">{value}</p>
    </div>
  );
}

export function Capsule({ children }: { children: ReactNode }) {
  return <span className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">{children}</span>;
}

export function OverviewCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="industrial-panel rounded-[20px] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-[#e0e5ec] shadow-[var(--industrial-shadow-card)]">
          <Icon className="h-4 w-4 text-[#ff4757]" strokeWidth={1.8} />
        </div>
        <div>
          <p className="industrial-label">{label}</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#2d3436]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function NumberedPanel({
  title,
  items,
  description,
  icon: Icon,
}: {
  title: string;
  items: string[];
  description?: string;
  icon: LucideIcon;
}) {
  return (
    <section className="industrial-panel industrial-bolted rounded-[26px]">
      <div className="industrial-panel-header">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] shadow-[var(--industrial-shadow-floating)]">
            <Icon className="h-5 w-5 text-[#ff4757]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="industrial-label">detail panel</p>
            <h3 className="truncate text-lg font-semibold text-[#2d3436]">{title}</h3>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="industrial-recessed rounded-[22px] p-4">
          {description ? <p className="mb-4 text-sm leading-7 text-[#4a5568]">{description}</p> : null}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={`${title}-${item}`} className="industrial-panel rounded-[18px] px-4 py-4">
                <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-4">
                  <span className="industrial-chip industrial-mono justify-center text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-7 text-[#4a5568]">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LensCard({
  lens,
  isActive,
  onSelect,
}: {
  lens: ResumeLens;
  isActive: boolean;
  onSelect: (lensId: ResumeLensTarget) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lens.id)}
      className={cn(
        "resume-lens-card industrial-button industrial-bolted w-full flex-col items-start rounded-[22px] px-4 py-4 text-left transition duration-200",
        isActive ? "industrial-button-primary" : "text-[#2d3436]",
      )}
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <span className={cn("industrial-label", isActive && "text-white/80")}>{lens.signal}</span>
        <span className={cn("industrial-chip industrial-mono text-[10px] font-bold uppercase tracking-[0.12em]", isActive ? "bg-white/16 text-white" : "text-[#4a5568]")}>{lens.label}</span>
      </div>
      <p className="mt-3 text-base font-semibold leading-6 normal-case tracking-normal">{lens.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {lens.focusSkills.map((skill) => (
          <span key={`${lens.id}-${skill}`} className={cn("rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]", isActive ? "border-white/30 text-white/90" : "border-[#a3b1c6] text-[#4a5568]")}>
            {skill}
          </span>
        ))}
      </div>
    </button>
  );
}

export function QuickStatCard({ stat }: { stat: ResumeQuickStat }) {
  return (
    <div className="industrial-panel rounded-[22px] px-4 py-4">
      <p className="industrial-label">{stat.label}</p>
      <p className="industrial-hero-title mt-4 text-[clamp(1.8rem,3vw,2.8rem)]">{stat.value}</p>
      <p className="mt-3 text-sm leading-7 text-[#4a5568]">{stat.detail}</p>
    </div>
  );
}

export function RecruiterBriefCard({
  lens,
  project,
  icon: Icon,
  onSendToNotes,
}: {
  lens: ResumeLens;
  project: ResumeTimelineProject | undefined;
  icon: LucideIcon;
  onSendToNotes: () => void;
}) {
  return (
    <div className="resume-brief-card industrial-panel industrial-bolted rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#a3b1c6]/55 pb-4">
        <div>
          <p className="industrial-label">Recruiter mode</p>
          <h3 className="mt-3 text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold leading-none tracking-[-0.04em] text-[#2d3436]">
            {lens.label}
          </h3>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#ff4757]">{lens.signal}</p>
        </div>
        <button
          type="button"
          onClick={onSendToNotes}
          className="industrial-button industrial-button-primary rounded-[18px] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em]"
        >
          Send brief to Notes
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
        <div className="space-y-4">
          <p className="text-base leading-8 text-[#4a5568]">{lens.summary}</p>
          <div className="industrial-recessed rounded-[22px] p-4">
            <p className="industrial-label">Recommended walkthrough</p>
            <p className="mt-3 text-sm leading-7 text-[#4a5568]">
              Start in the {lens.recommendedSection} section
              {project ? ` and use ${project.title} as the proof point.` : "."}
            </p>
          </div>
          {project ? (
            <div className="industrial-recessed rounded-[22px] p-4">
              <p className="industrial-label">Best project for this angle</p>
              <p className="mt-3 text-base font-semibold text-[#2d3436]">{project.title}</p>
              <p className="mt-2 text-sm leading-7 text-[#4a5568]">{project.description}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <NumberedPanel title="What to say" items={lens.talkingPoints} icon={Icon} />
        </div>
      </div>
    </div>
  );
}
