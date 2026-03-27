"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleFadingArrowUp,
  GalleryHorizontal,
  type LucideIcon,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Image from "next/image";

import type { AppComponentProps } from "@/entities/app";
import { cn } from "@/shared/lib";

import { portfolioFilters, portfolioProjects } from "../model/content";

const motionEase: [number, number, number, number] = [0.175, 0.885, 0.32, 1.275];

type PortfolioFilterId = (typeof portfolioFilters)[number]["id"];

export function PortfolioApp({ processId }: AppComponentProps) {
  const reduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<PortfolioFilterId>("featured");
  const [selectedProjectId, setSelectedProjectId] = useState(portfolioProjects[0]?.id ?? "");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") {
      return portfolioProjects;
    }

    if (activeFilter === "featured") {
      return portfolioProjects.filter((project) => project.featured);
    }

    return portfolioProjects.filter(
      (project) => project.status === activeFilter || project.filterTokens.includes(activeFilter.toLowerCase()),
    );
  }, [activeFilter]);

  const selectedProject = useMemo(
    () => filteredProjects.find((project) => project.id === selectedProjectId) ?? filteredProjects[0] ?? null,
    [filteredProjects, selectedProjectId],
  );

  const activeProjectId = selectedProject?.id ?? "";
  const gallery = selectedProject?.gallery ?? [];
  const clampedImageIndex = gallery.length > 0 ? Math.min(activeImageIndex, gallery.length - 1) : 0;
  const activeImage = gallery[clampedImageIndex];
  const sessionCode = processId.slice(0, 6).toUpperCase();
  const totalTech = useMemo(
    () => new Set(portfolioProjects.flatMap((project) => project.stack)).size,
    [],
  );

  return (
    <div className="industrial-app portfolio-app portfolio-app-shell industrial-shell flex h-full min-h-0 flex-col overflow-hidden">
      <header className="industrial-status-strip px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="industrial-led industrial-led--live animate-pulse" aria-hidden="true" />
          <div className="min-w-0">
            <p className="industrial-label">Portfolio Console</p>
            <p className="truncate text-sm font-semibold text-[#2d3436]">Project browser calibrated for real shipping work</p>
          </div>
        </div>
        <div className="portfolio-marquee-track industrial-mono hidden min-w-0 flex-1 overflow-hidden text-xs font-medium uppercase tracking-[0.14em] text-[#4a5568] lg:block">
          <div className="flex min-w-max gap-8 whitespace-nowrap pr-8">
            <span>signal stable</span>
            <span>case studies mapped</span>
            <span>industrial realism active</span>
            <span>session {sessionCode}</span>
            <span>signal stable</span>
            <span>case studies mapped</span>
            <span>industrial realism active</span>
            <span>session {sessionCode}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a5568]">
            <span className="industrial-led animate-pulse" aria-hidden="true" />
            live
          </div>
          <div className="industrial-vent" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[330px_minmax(0,1fr)] lg:p-5">
        <aside className="min-h-0 overflow-auto pr-1">
          <div className="space-y-4">
            <Panel
              title="Control Deck"
              icon={BriefcaseBusiness}
              meta={`${filteredProjects.length} visible`}
              elevated
            >
              <div className="space-y-4">
                <div className="industrial-recessed rounded-[24px] p-5">
                  <div className="industrial-tape text-[11px] font-bold uppercase tracking-[0.12em] text-[#2d3436]">
                    <span>Featured builds only</span>
                  </div>
                  <h1 className="industrial-hero-title mt-5 max-w-[10ch]">Portfolio</h1>
                  <p className="mt-4 max-w-[28ch] text-sm leading-7 text-[#4a5568]">
                    An interactive project rack built like hardware: browsable, inspectable, and focused on shipped thinking instead of decorative cards.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <MetricCard label="Projects" value={String(portfolioProjects.length).padStart(2, "0")} tone="live" />
                  <MetricCard label="Featured" value={String(portfolioProjects.filter((project) => project.featured).length).padStart(2, "0")} tone="accent" />
                  <MetricCard label="Tooling" value={String(totalTech).padStart(2, "0")} tone="warn" />
                </div>
              </div>
            </Panel>

            <Panel title="Filter Array" icon={Settings2} meta={activeFilter.replace(/-/g, " ")}>
              <div className="flex flex-wrap gap-3">
                {portfolioFilters.map((filter) => {
                  const active = filter.id === activeFilter;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => {
                        setActiveFilter(filter.id as PortfolioFilterId);
                        setActiveImageIndex(0);
                      }}
                      className={cn(
                        "industrial-button px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em]",
                        active
                          ? "industrial-button-primary"
                          : "bg-transparent text-[#4a5568] hover:text-[#2d3436]",
                      )}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Project Queue" icon={GalleryHorizontal} meta={`session ${sessionCode}`}>
              <div className="space-y-3">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project, index) => {
                    const active = project.id === activeProjectId;

                    return (
                      <motion.button
                        key={project.id}
                        layout={!reduceMotion}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setActiveImageIndex(0);
                        }}
                        whileHover={reduceMotion ? undefined : { y: -3 }}
                        transition={{ duration: 0.24, ease: motionEase }}
                        className={cn(
                          "industrial-button industrial-bolted w-full items-start justify-between rounded-[18px] px-4 py-4 text-left",
                          active ? "industrial-button-primary" : "text-[#2d3436]",
                        )}
                      >
                        <div className="min-w-0">
                          <p className={cn("industrial-label", active && "text-white/80")}>rack {String(index + 1).padStart(2, "0")}</p>
                          <p className="mt-2 text-lg font-semibold leading-5">{project.title}</p>
                          <p className={cn("mt-2 text-sm leading-6", active ? "text-white/90" : "text-[#4a5568]")}>{project.summary}</p>
                        </div>
                        <div className={cn("industrial-chip industrial-mono shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]", active ? "border-white/20 bg-white/15 text-white" : "text-[#4a5568]")}>
                          {project.statusLabel}
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="industrial-recessed rounded-[20px] p-4 text-sm leading-6 text-[#4a5568]">
                    No projects match this filter yet.
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </aside>

        <main className="min-h-0 overflow-auto pr-1">
          {selectedProject ? (
            <div className="space-y-4">
              <Panel
                title="Featured Module"
                icon={ShieldCheck}
                meta={selectedProject.statusLabel}
                elevated
                bolted
              >
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_360px]">
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-3">
                      <Badge>{selectedProject.type}</Badge>
                      <Badge>{selectedProject.period}</Badge>
                      <Badge>{selectedProject.timeSpent}</Badge>
                    </div>
                    <div>
                      <p className="industrial-label">{selectedProject.heroLabel}</p>
                      <h2 className="mt-3 text-[clamp(2rem,3.8vw,4rem)] font-extrabold leading-none tracking-[-0.04em] text-[#2d3436] drop-shadow-[0_1px_0_#ffffff]">
                        {selectedProject.title}
                      </h2>
                      <p className="mt-4 max-w-[62ch] text-base leading-8 text-[#4a5568]">{selectedProject.description}</p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <TelemetryCard label="Stack units" value={String(selectedProject.stack.length).padStart(2, "0")} />
                      <TelemetryCard label="Highlights" value={String(selectedProject.highlights.length).padStart(2, "0")} />
                      <TelemetryCard label="Challenges" value={String(selectedProject.challenges.length).padStart(2, "0")} />
                    </div>
                  </div>

                  <DevicePreview
                    imageSrc={activeImage?.src ?? gallery[0]?.src ?? ""}
                    imageAlt={activeImage?.alt ?? gallery[0]?.alt ?? selectedProject.title}
                    imageLabel={activeImage?.label ?? gallery[0]?.label ?? selectedProject.title}
                    projectTitle={selectedProject.title}
                    projectAccent={selectedProject.accent}
                    statusLabel={selectedProject.statusLabel}
                  />
                </div>
              </Panel>

              <div className="industrial-divider" aria-hidden="true" />

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_340px]">
                <div className="space-y-4">
                  <Panel title="Signal Gallery" icon={GalleryHorizontal} meta={`${gallery.length} frames`}>
                    <div className="grid gap-4 md:grid-cols-2">
                      {gallery.map((image, index) => {
                        const active = index === clampedImageIndex;

                        return (
                          <button
                            key={`${selectedProject.id}-${image.src}`}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            className={cn(
                              "industrial-button group flex-col items-stretch overflow-hidden rounded-[20px] p-0 text-left",
                              active ? "industrial-button-primary" : "bg-transparent",
                            )}
                          >
                            <Image
                              src={image.src}
                              alt={image.alt}
                              width={960}
                              height={540}
                              className="aspect-[16/9] h-auto w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            />
                            <div className={cn("grid grid-cols-[82px_minmax(0,1fr)] gap-3 px-4 py-4", active ? "text-white" : "text-[#2d3436]")}>
                              <span className={cn("industrial-label", active && "text-white/80")}>frame {String(index + 1).padStart(2, "0")}</span>
                              <span className="text-sm leading-6">{image.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Panel>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <Panel title="Engineering Highlights" icon={CircleFadingArrowUp}>
                      <NumberedList items={selectedProject.highlights} accent="accent" />
                    </Panel>
                    <Panel title="Hard Problems" icon={Wrench}>
                      <NumberedList items={selectedProject.challenges} accent="neutral" />
                    </Panel>
                  </div>
                </div>

                <div className="space-y-4">
                  <Panel title="Telemetry" icon={Settings2}>
                    <PropertyList
                      rows={[
                        { label: "Type", value: selectedProject.type },
                        { label: "Status", value: selectedProject.statusLabel },
                        { label: "Timeline", value: selectedProject.period },
                        { label: "Build Window", value: selectedProject.timeSpent },
                      ]}
                    />
                  </Panel>

                  <Panel title="Outbound Links" icon={ArrowUpRight}>
                    <div className="space-y-3">
                      {selectedProject.links.length > 0 ? (
                        selectedProject.links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="industrial-button industrial-link industrial-bolted w-full justify-between rounded-[18px] px-4 py-3 text-sm font-semibold"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                          </a>
                        ))
                      ) : (
                        <div className="industrial-recessed rounded-[18px] p-4 text-sm leading-6 text-[#4a5568]">
                          No public links are connected yet, but the case study structure is already live.
                        </div>
                      )}
                    </div>
                  </Panel>

                  <Panel title="Stack Rack" icon={Settings2}>
                    <div className="flex flex-wrap gap-3">
                      {selectedProject.stack.map((item) => (
                        <span key={item} className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="What It Changed" icon={ShieldCheck}>
                    <NumberedList items={selectedProject.lessons} accent="neutral" />
                  </Panel>
                </div>
              </div>

              <div className="industrial-panel industrial-bolted rounded-[24px] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="industrial-label">Maintenance note</p>
                    <p className="mt-2 text-sm leading-7 text-[#4a5568]">
                      Replace the assets in `public/portfolio/` and the presentation layer keeps the same control-panel structure.
                    </p>
                  </div>
                  <div className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">
                    chassis ready for new captures
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Panel title="Project Feed" icon={BriefcaseBusiness}>
              <div className="industrial-recessed rounded-[24px] p-6 text-sm leading-7 text-[#4a5568]">
                No project selected.
              </div>
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
}

function Panel({
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

function MetricCard({ label, value, tone }: { label: string; value: string; tone: "live" | "accent" | "warn" }) {
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

function TelemetryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="industrial-recessed rounded-[20px] p-4">
      <p className="industrial-label">{label}</p>
      <p className="industrial-mono mt-3 text-2xl font-semibold text-[#2d3436]">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">{children}</span>;
}

function DevicePreview({
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
          {imageSrc ? (
            <Image src={imageSrc} alt={imageAlt} width={1200} height={1500} className="h-full w-full object-cover opacity-90" priority />
          ) : null}
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

function PropertyList({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="industrial-recessed rounded-[20px] overflow-hidden">
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

function NumberedList({ items, accent }: { items: string[]; accent: "accent" | "neutral" }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="industrial-recessed rounded-[18px] p-4">
          <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-4">
            <div className={cn("industrial-chip industrial-mono justify-center text-[11px] font-bold uppercase tracking-[0.12em]", accent === "accent" ? "bg-[#ff4757] text-white" : "text-[#4a5568]") }>
              {String(index + 1).padStart(2, "0")}
            </div>
            <p className="text-sm leading-7 text-[#4a5568]">{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
