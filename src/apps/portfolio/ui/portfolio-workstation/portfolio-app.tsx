"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleFadingArrowUp,
  GalleryHorizontal,
  MessageSquareShare,
  Radar,
  Send,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Image from "next/image";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import {
  PORTFOLIO_FOCUS_REQUEST_EVENT,
  cn,
  consumePortfolioFocusRequest,
  openNotesWithRequest,
  openAgentWithRequest,
  openResumeWithFocus,
  type PortfolioFocusRequest,
  type PortfolioHandoffTarget,
} from "@/shared/lib";

import { portfolioFilters, portfolioProjects } from "../../model/content";
import { buildPortfolioAiContext } from "../../model/portfolio-ai-context";
import {
  Badge,
  DevicePreview,
  HandoffActionButton,
  HandoffCard,
  HandoffSummary,
  MetricCard,
  NumberedList,
  Panel,
  PropertyList,
  TelemetryCard,
} from "./portfolio-app.parts";

const motionEase: [number, number, number, number] = [0.175, 0.885, 0.32, 1.275];

type PortfolioFilterId = (typeof portfolioFilters)[number]["id"];

function getDefaultHandoffId(projectId?: string): PortfolioHandoffTarget {
  const project = portfolioProjects.find((entry) => entry.id === projectId) ?? portfolioProjects[0];
  return project?.handoffs[0]?.id ?? "recruiter";
}

function describeRequestSource(source?: string) {
  return source ?? "another PortOS surface";
}

export function PortfolioApp({ processId, windowId }: AppComponentProps) {
  const reduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<PortfolioFilterId>("featured");
  const [selectedProjectId, setSelectedProjectId] = useState(portfolioProjects[0]?.id ?? "");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeHandoffId, setActiveHandoffId] = useState<PortfolioHandoffTarget>(getDefaultHandoffId());
  const [handoffStatus, setHandoffStatus] = useState("Dispatch bay ready for recruiter, client, or technical handoffs.");
  const [lastExternalSource, setLastExternalSource] = useState<string | null>(null);

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
  const totalTech = useMemo(() => new Set(portfolioProjects.flatMap((project) => project.stack)).size, []);
  const activeHandoff = useMemo(
    () => selectedProject?.handoffs.find((handoff) => handoff.id === activeHandoffId) ?? selectedProject?.handoffs[0] ?? null,
    [activeHandoffId, selectedProject],
  );
  const activeHandoffIdValue = activeHandoff?.id ?? "recruiter";

  const revealProject = useCallback((projectId: string) => {
    const nextProject = portfolioProjects.find((project) => project.id === projectId);

    if (!nextProject) {
      return;
    }

    setSelectedProjectId(nextProject.id);
    setActiveImageIndex(0);
    setActiveHandoffId(nextProject.handoffs[0]?.id ?? "recruiter");
  }, []);

  const applyFocusRequest = useCallback(
    (request: PortfolioFocusRequest | null) => {
      if (!request) {
        return;
      }

      if (request.filterId && portfolioFilters.some((filter) => filter.id === request.filterId)) {
        setActiveFilter(request.filterId as PortfolioFilterId);
      }

      if (request.projectId) {
        revealProject(request.projectId);
      }

      if (request.handoffId) {
        setActiveHandoffId(request.handoffId);
      }

      setActiveImageIndex(0);
      setLastExternalSource(describeRequestSource(request.source));
      setHandoffStatus(`Focused from ${describeRequestSource(request.source)}.`);
    },
    [revealProject],
  );

  useEffect(() => {
    const pendingRequest = consumePortfolioFocusRequest(windowId);

    if (!pendingRequest) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      applyFocusRequest(pendingRequest);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [applyFocusRequest, windowId]);

  useEffect(() => {
    const handlePortfolioFocusRequest = (event: Event) => {
      const detail = (event as CustomEvent<PortfolioFocusRequest>).detail;

      if (detail.targetWindowId && detail.targetWindowId !== windowId) {
        return;
      }

      applyFocusRequest(detail);
    };

    window.addEventListener(PORTFOLIO_FOCUS_REQUEST_EVENT, handlePortfolioFocusRequest);

    return () => {
      window.removeEventListener(PORTFOLIO_FOCUS_REQUEST_EVENT, handlePortfolioFocusRequest);
    };
  }, [applyFocusRequest, windowId]);

  const aiPublishWindowContext = useOSStore((state) => state.aiPublishWindowContext);
  const aiClearWindowContext = useOSStore((state) => state.aiClearWindowContext);

  useEffect(() => {
    aiPublishWindowContext(
      windowId,
      buildPortfolioAiContext({
        windowId,
        activeFilter,
        selectedProjectId: activeProjectId,
        selectedProjectTitle: selectedProject?.title ?? null,
        visibleProjectCount: filteredProjects.length,
        activeHandoffId: activeHandoffIdValue,
      }),
    );
  }, [activeFilter, activeHandoffIdValue, activeProjectId, aiPublishWindowContext, filteredProjects.length, selectedProject?.title, windowId]);

  useEffect(() => {
    return () => {
      aiClearWindowContext(windowId);
    };
  }, [aiClearWindowContext, windowId]);

  const sendBriefToNotes = useCallback(async () => {
    if (!selectedProject || !activeHandoff) {
      return;
    }

    await openNotesWithRequest({
      mode: "create",
      title: activeHandoff.noteTitle,
      body: activeHandoff.noteBody,
      tags: ["portfolio", selectedProject.id, activeHandoff.id],
      pinned: true,
      selectAfterWrite: true,
      source: `portfolio:${selectedProject.id}`,
    });

    setHandoffStatus(`Sent ${activeHandoff.label.toLowerCase()} to Notes.`);
  }, [activeHandoff, selectedProject]);

  const openResumeEvidence = useCallback(async () => {
    if (!selectedProject || !activeHandoff) {
      return;
    }

    await openResumeWithFocus({
      projectId: selectedProject.id,
      lensId: activeHandoff.recommendedResumeLens,
      sectionId: activeHandoff.recommendedResumeSection,
      source: `Portfolio ${activeHandoff.label}`,
    });

    setHandoffStatus(`Opened Resume on ${activeHandoff.recommendedResumeLens} evidence for ${selectedProject.title}.`);
  }, [activeHandoff, selectedProject]);

  const sendToAgent = useCallback(async () => {
    if (!selectedProject || !activeHandoff) {
      return;
    }

    await openAgentWithRequest({
      prompt: activeHandoff.agentPrompt,
      title: activeHandoff.agentTitle,
      source: {
        appId: "portfolio",
        label: `${selectedProject.title} / ${activeHandoff.label}`,
      },
      suggestions: activeHandoff.suggestions,
    });

    setHandoffStatus(`Sent ${selectedProject.title} to the AI agent for a ${activeHandoff.label.toLowerCase()}.`);
  }, [activeHandoff, selectedProject]);

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
            <span>dispatch bay active</span>
            <span>session {sessionCode}</span>
            <span>signal stable</span>
            <span>case studies mapped</span>
            <span>dispatch bay active</span>
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
            <Panel title="Control Deck" icon={BriefcaseBusiness} meta={`${filteredProjects.length} visible`} elevated>
              <div className="space-y-4">
                <div className="industrial-recessed rounded-[24px] p-5">
                  <div className="industrial-tape text-[11px] font-bold uppercase tracking-[0.12em] text-[#2d3436]">
                    <span>Featured builds only</span>
                  </div>
                  <h1 className="industrial-hero-title mt-5 max-w-[10ch]">Portfolio</h1>
                  <p className="mt-4 max-w-[28ch] text-sm leading-7 text-[#4a5568]">
                    An interactive project rack built like hardware: browsable, inspectable, and now able to hand project context into other PortOS tools.
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
                        active ? "industrial-button-primary" : "bg-transparent text-[#4a5568] hover:text-[#2d3436]",
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
                        onClick={() => revealProject(project.id)}
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
                        <div
                          className={cn(
                            "industrial-chip industrial-mono shrink-0 text-[10px] font-bold uppercase tracking-[0.12em]",
                            active ? "border-white/20 bg-white/15 text-white" : "text-[#4a5568]",
                          )}
                        >
                          {project.statusLabel}
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="industrial-recessed rounded-[20px] p-4 text-sm leading-6 text-[#4a5568]">No projects match this filter yet.</div>
                )}
              </div>
            </Panel>
          </div>
        </aside>

        <main className="min-h-0 overflow-auto pr-1">
          {selectedProject ? (
            <div className="space-y-4">
              <Panel title="Featured Module" icon={ShieldCheck} meta={selectedProject.statusLabel} elevated bolted>
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
                            <div
                              className={cn(
                                "grid grid-cols-[82px_minmax(0,1fr)] gap-3 px-4 py-4",
                                active ? "text-white" : "text-[#2d3436]",
                              )}
                            >
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

                  {activeHandoff ? (
                    <Panel title="Dispatch Bay" icon={MessageSquareShare} meta={activeHandoff.label} bolted>
                      <div className="space-y-4">
                        <div className="grid gap-3 lg:grid-cols-3">
                          {selectedProject.handoffs.map((handoff) => (
                            <HandoffCard
                              key={handoff.id}
                              handoff={handoff}
                              isActive={handoff.id === activeHandoffIdValue}
                              onSelect={setActiveHandoffId}
                            />
                          ))}
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${selectedProject.id}-${activeHandoff.id}`}
                            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="space-y-4"
                          >
                            <HandoffSummary handoff={activeHandoff} project={selectedProject} />

                            <div className="grid gap-4 xl:grid-cols-2">
                              <Panel title="Briefing Points" icon={Radar}>
                                <NumberedList items={activeHandoff.briefingPoints} accent="accent" />
                              </Panel>
                              <Panel title="Evidence Pack" icon={ShieldCheck}>
                                <NumberedList items={activeHandoff.evidencePoints} accent="neutral" />
                              </Panel>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                              <HandoffActionButton
                                label="Send to Notes"
                                helper="Create a reusable project brief inside Notes with tags and pinned context."
                                onClick={() => {
                                  void sendBriefToNotes();
                                }}
                                active
                              />
                              <HandoffActionButton
                                label="Open Resume Evidence"
                                helper={`Jump Resume into ${activeHandoff.recommendedResumeLens} mode and the ${activeHandoff.recommendedResumeSection} section.`}
                                onClick={() => {
                                  void openResumeEvidence();
                                }}
                              />
                              <HandoffActionButton
                                label="Ask AI Agent"
                                helper="Send the active project and audience framing into the agent for a tailored explanation."
                                onClick={() => {
                                  void sendToAgent();
                                }}
                              />
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </Panel>
                  ) : null}
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
                    <p className="industrial-label">Dispatch status</p>
                    <p className="mt-2 text-sm leading-7 text-[#4a5568]">
                      {handoffStatus}
                      {lastExternalSource ? ` Last external source: ${lastExternalSource}.` : ""}
                    </p>
                  </div>
                  <div className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">
                    <Send className="h-3.5 w-3.5" strokeWidth={1.8} />
                    handoff ready
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Panel title="Project Feed" icon={BriefcaseBusiness}>
              <div className="industrial-recessed rounded-[24px] p-6 text-sm leading-7 text-[#4a5568]">No project selected.</div>
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
}
