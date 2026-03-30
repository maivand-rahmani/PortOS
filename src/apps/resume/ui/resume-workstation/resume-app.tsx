"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  FileDown,
  Github,
  GraduationCap,
  PanelsTopLeft,
  ScanLine,
  ShieldCheck,
  Sparkles,
  SquareChartGantt,
  UserRound,
  Wrench,
} from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import {
  RESUME_FOCUS_REQUEST_EVENT,
  cn,
  consumeResumeFocusRequest,
  openNotesWithPrefill,
  type ResumeFocusRequest,
  type ResumeLensTarget,
} from "@/shared/lib";

import { resumeContent, type ResumeSectionId } from "../../model/content";
import {
  Capsule,
  DockPanel,
  LensCard,
  MetricBadge,
  NumberedPanel,
  OverviewCard,
  QuickStatCard,
  RecruiterBriefCard,
  ResumeSection,
} from "./resume-app.parts";

const sectionOrder: Array<{ id: ResumeSectionId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "playbook", label: "Playbook" },
];

function getDefaultLensId(): ResumeLensTarget {
  return resumeContent.lenses[0]?.id ?? "balanced";
}

export function ResumeApp({ processId, windowId }: AppComponentProps) {
  const [activeSection, setActiveSection] = useState<ResumeSectionId>("timeline");
  const [collapsedSections, setCollapsedSections] = useState<Record<ResumeSectionId, boolean>>({
    overview: false,
    timeline: false,
    education: false,
    skills: false,
    playbook: false,
  });
  const [selectedProjectId, setSelectedProjectId] = useState(resumeContent.timeline[0]?.id ?? "");
  const [activeLensId, setActiveLensId] = useState<ResumeLensTarget>(getDefaultLensId);
  const [lastExternalSource, setLastExternalSource] = useState<string | null>(null);
  const [briefStatus, setBriefStatus] = useState("Ready to tailor the profile.");

  const selectedProject = useMemo(
    () => resumeContent.timeline.find((project) => project.id === selectedProjectId) ?? resumeContent.timeline[0],
    [selectedProjectId],
  );

  const activeLens = useMemo(
    () => resumeContent.lenses.find((lens) => lens.id === activeLensId) ?? resumeContent.lenses[0],
    [activeLensId],
  );

  const revealSection = useCallback((sectionId: ResumeSectionId) => {
    setActiveSection(sectionId);
    setCollapsedSections((current) => ({ ...current, [sectionId]: false }));

    if (typeof document !== "undefined") {
      window.requestAnimationFrame(() => {
        document.getElementById(`resume-section-${sectionId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, []);

  const selectLens = (lensId: ResumeLensTarget) => {
    const nextLens = resumeContent.lenses.find((lens) => lens.id === lensId);

    if (!nextLens) {
      return;
    }

    setActiveLensId(lensId);
    setBriefStatus(`Switched to ${nextLens.label.toLowerCase()} mode.`);

    if (nextLens.recommendedProjectId) {
      setSelectedProjectId(nextLens.recommendedProjectId);
    }

    revealSection(nextLens.recommendedSection);
  };

  const applyFocusRequest = useCallback((request: ResumeFocusRequest | null) => {
    if (!request) {
      return;
    }

    if (request.lensId) {
      const requestedLens = resumeContent.lenses.find((lens) => lens.id === request.lensId);

      if (requestedLens) {
        setActiveLensId(requestedLens.id);

        if (requestedLens.recommendedProjectId) {
          setSelectedProjectId(requestedLens.recommendedProjectId);
        }

        if (!request.sectionId) {
          revealSection(requestedLens.recommendedSection);
        }
      }
    }

    if (request.projectId && resumeContent.timeline.some((project) => project.id === request.projectId)) {
      setSelectedProjectId(request.projectId);
    }

    if (request.sectionId) {
      revealSection(request.sectionId);
    }

    setLastExternalSource(request.source ?? "external trigger");
    setBriefStatus(`Focused from ${request.source ?? "another PortOS surface"}.`);
  }, [revealSection]);

  useEffect(() => {
    const pendingRequest = consumeResumeFocusRequest(windowId);

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
    const handleResumeFocusRequest = (event: Event) => {
      const detail = (event as CustomEvent<ResumeFocusRequest>).detail;

      if (detail.targetWindowId && detail.targetWindowId !== windowId) {
        return;
      }

      applyFocusRequest(detail);
    };

    window.addEventListener(RESUME_FOCUS_REQUEST_EVENT, handleResumeFocusRequest);

    return () => {
      window.removeEventListener(RESUME_FOCUS_REQUEST_EVENT, handleResumeFocusRequest);
    };
  }, [applyFocusRequest, windowId]);

  const toggleSection = (sectionId: ResumeSectionId) => {
    setCollapsedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const sendBriefToNotes = async () => {
    if (!activeLens) {
      return;
    }

    const projectName = selectedProject?.title ?? "Selected project";

    await openNotesWithPrefill({
      title: `Resume brief - ${activeLens.label}`,
      body: [
        `Lens: ${activeLens.label}`,
        `Signal: ${activeLens.signal}`,
        `Recommended section: ${activeLens.recommendedSection}`,
        `Project proof point: ${projectName}`,
        "",
        "Talking points:",
        ...activeLens.talkingPoints.map((point, index) => `${index + 1}. ${point}`),
      ].join("\n"),
      tags: ["resume", activeLens.id, selectedProject?.id ?? "project-brief"],
      pinned: true,
    });

    setBriefStatus(`Sent ${activeLens.label.toLowerCase()} brief to Notes.`);
  };

  return (
    <div className="industrial-app resume-app industrial-shell flex h-full min-h-0 flex-col overflow-hidden">
      <header className="industrial-status-strip px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="industrial-led industrial-led--live animate-pulse" aria-hidden="true" />
          <div className="min-w-0">
            <p className="industrial-label">Resume Console</p>
            <p className="truncate text-sm font-semibold text-[#2d3436]">Candidate profile rendered as a working technical dossier</p>
          </div>
        </div>
        <div className="resume-marquee-track industrial-mono hidden min-w-0 flex-1 overflow-hidden text-xs font-medium uppercase tracking-[0.14em] text-[#4a5568] lg:block">
          <div className="flex min-w-max gap-8 whitespace-nowrap pr-8">
            <span>architecture first</span>
            <span>honest junior profile</span>
            <span>live project evidence</span>
            <span>session {processId.slice(0, 6).toUpperCase()}</span>
            <span>architecture first</span>
            <span>honest junior profile</span>
            <span>live project evidence</span>
            <span>session {processId.slice(0, 6).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="industrial-chip industrial-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">
            candidate ready
          </div>
          <div className="industrial-vent" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-5">
        <aside className="resume-print-hidden min-h-0 overflow-auto pr-1">
          <div className="space-y-4">
            <DockPanel title="Candidate Deck" icon={UserRound} meta={resumeContent.profile.level} elevated>
              <div className="industrial-recessed rounded-[24px] p-5">
                <div className="industrial-tape text-[11px] font-bold uppercase tracking-[0.12em] text-[#2d3436]">
                  <span>Open to first strong role</span>
                </div>
                <h1 className="industrial-hero-title mt-5 max-w-[9ch]">{resumeContent.profile.name}</h1>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#ff4757]">{resumeContent.profile.role}</p>
                <p className="mt-4 text-sm leading-7 text-[#4a5568]">{resumeContent.profile.journey}</p>
              </div>

              <div className="mt-4 grid gap-3">
                <MetricBadge label="Years Learning" value="1.5" tone="live" />
                <MetricBadge label="Study Status" value={resumeContent.education.yearLabel.replace("Year ", "Y0")} tone="warn" />
                <MetricBadge label="Location" value={resumeContent.profile.location} tone="accent" />
              </div>
            </DockPanel>

            <DockPanel title="Navigation Rail" icon={PanelsTopLeft} meta={`${sectionOrder.length} modules`}>
              <div className="space-y-3">
                {sectionOrder.map((section, index) => {
                  const isActive = section.id === activeSection;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => revealSection(section.id)}
                      className={cn(
                        "industrial-button industrial-bolted w-full justify-between rounded-[18px] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em]",
                        isActive ? "industrial-button-primary" : "text-[#2d3436]",
                      )}
                    >
                      <span>{section.label}</span>
                      <span className="industrial-mono text-[11px]">{String(index + 1).padStart(2, "0")}</span>
                    </button>
                  );
                })}
              </div>
            </DockPanel>

            <DockPanel title="Recruiter Lens" icon={Sparkles} meta={activeLens?.signal}>
              <div className="space-y-3">
                {resumeContent.lenses.map((lens) => (
                  <LensCard key={lens.id} lens={lens} isActive={lens.id === activeLens?.id} onSelect={selectLens} />
                ))}
              </div>
            </DockPanel>

            <DockPanel title="Export + Links" icon={ShieldCheck}>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="industrial-button industrial-button-primary w-full rounded-[18px] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em]"
                >
                  <FileDown className="h-4 w-4" strokeWidth={1.8} />
                  Print / Save PDF
                </button>

                {resumeContent.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    className="industrial-button industrial-link industrial-bolted w-full justify-between rounded-[18px] px-4 py-3 text-left text-sm font-semibold"
                  >
                    <span>{link.label}</span>
                    <span className="truncate pl-3 text-xs text-[#4a5568] no-underline">{link.value}</span>
                  </a>
                ))}
              </div>
            </DockPanel>
          </div>
        </aside>

        <main className="min-h-0 overflow-auto pr-1">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {activeLens ? (
              <RecruiterBriefCard
                lens={activeLens}
                project={selectedProject}
                icon={Sparkles}
                onSendToNotes={() => {
                  void sendBriefToNotes();
                }}
              />
            ) : null}

            <ResumeSection title="Candidate Overview" icon={ShieldCheck} id="overview" collapsed={collapsedSections.overview} onToggle={() => toggleSection("overview")} elevated>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_360px]">
                <div className="industrial-recessed rounded-[26px] p-5 sm:p-6">
                  <div className="flex flex-wrap gap-3">
                    <Capsule>junior+</Capsule>
                    <Capsule>currently studying</Capsule>
                    <Capsule>{resumeContent.profile.location}</Capsule>
                  </div>
                  <h2 className="mt-5 text-[clamp(2rem,4vw,4rem)] font-extrabold leading-none tracking-[-0.04em] text-[#2d3436] drop-shadow-[0_1px_0_#ffffff]">
                    Building web products with architecture in mind.
                  </h2>
                  <p className="mt-5 max-w-[62ch] text-base leading-8 text-[#4a5568]">{resumeContent.profile.focus}</p>
                  <p className="mt-4 max-w-[62ch] text-sm leading-7 text-[#4a5568]">
                    {resumeContent.profile.studyStatus}. This dossier focuses on actual projects, technical direction, and the systems thinking behind the work.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <OverviewCard label="Current Level" value={resumeContent.profile.level} icon={UserRound} />
                    <OverviewCard label="Primary Focus" value="Frontend + AI" icon={PanelsTopLeft} />
                    <OverviewCard label="Learning Window" value="1.5 Years" icon={ScanLine} />
                    <OverviewCard label="Current Goal" value="First Real Role" icon={SquareChartGantt} />
                  </div>
                  <div className="industrial-panel industrial-bolted rounded-[22px] p-4">
                    <p className="industrial-label">Opportunity signal</p>
                    <p className="mt-3 text-sm leading-7 text-[#4a5568]">
                      Open to strong freelance work and a first full-time product engineering opportunity with room to learn fast.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {resumeContent.quickStats.map((stat) => (
                  <QuickStatCard key={stat.label} stat={stat} />
                ))}
              </div>
            </ResumeSection>

            <div className="industrial-divider" aria-hidden="true" />

            <ResumeSection title="Project Timeline" icon={PanelsTopLeft} id="timeline" collapsed={collapsedSections.timeline} onToggle={() => toggleSection("timeline")}>
              <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="industrial-recessed rounded-[24px] p-4">
                  <div className="space-y-3">
                    {resumeContent.timeline.map((project, index) => {
                      const isActive = project.id === selectedProject?.id;

                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setActiveSection("timeline");
                          }}
                          className={cn(
                            "industrial-button industrial-bolted w-full flex-col items-start rounded-[18px] px-4 py-4 text-left",
                            isActive ? "industrial-button-primary" : "text-[#2d3436]",
                          )}
                        >
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className={cn("industrial-label", isActive && "text-white/80")}>{project.badge}</span>
                            <span className={cn("industrial-mono text-[11px] uppercase tracking-[0.12em]", isActive ? "text-white/80" : "text-[#4a5568]")}>{String(index + 1).padStart(2, "0")}</span>
                          </div>
                          <span className="mt-2 text-base font-semibold leading-6 normal-case tracking-normal">{project.title}</span>
                          <span className={cn("mt-1 text-sm normal-case tracking-normal", isActive ? "text-white/90" : "text-[#4a5568]")}>{project.type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedProject ? (
                  <div className="industrial-panel industrial-bolted rounded-[28px] p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#a3b1c6]/55 pb-4">
                      <div>
                        <p className="industrial-label">{selectedProject.badge}</p>
                        <h3 className="mt-3 text-[clamp(1.8rem,3vw,3.2rem)] font-extrabold leading-none tracking-[-0.04em] text-[#2d3436]">
                          {selectedProject.title}
                        </h3>
                        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#ff4757]">{selectedProject.type}</p>
                      </div>
                      <div className="industrial-chip industrial-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">
                        real shipped learning
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
                      <div>
                        <p className="text-base leading-8 text-[#4a5568]">{selectedProject.description}</p>
                        <p className="mt-4 text-sm leading-7 text-[#4a5568]">{selectedProject.detail}</p>

                        <div className="industrial-recessed mt-5 rounded-[22px] p-4">
                          <p className="industrial-label">Stack</p>
                          <p className="mt-3 text-sm leading-7 text-[#4a5568]">{selectedProject.stack.join(" / ")}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <NumberedPanel title="What It Shows" items={selectedProject.highlights} icon={ShieldCheck} />

                        <div className="grid gap-3 sm:grid-cols-2">
                          {selectedProject.repoUrl ? (
                            <a
                              href={selectedProject.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="industrial-button industrial-link industrial-bolted justify-center rounded-[18px] px-4 py-3 text-sm font-semibold"
                            >
                              <Github className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                              Repository
                            </a>
                          ) : null}
                          {selectedProject.liveUrl ? (
                            <a
                              href={selectedProject.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="industrial-button industrial-link industrial-bolted justify-center rounded-[18px] px-4 py-3 text-sm font-semibold"
                            >
                              <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                              Live Demo
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </ResumeSection>

            <ResumeSection title="Education" icon={GraduationCap} id="education" collapsed={collapsedSections.education} onToggle={() => toggleSection("education")}>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.92fr)]">
                <div className="industrial-recessed rounded-[24px] p-5">
                  <p className="industrial-label">Current Education</p>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-[#4a5568]">
                    <p><span className="font-semibold uppercase tracking-[0.08em] text-[#2d3436]">Institution:</span> {resumeContent.education.institution}</p>
                    <p><span className="font-semibold uppercase tracking-[0.08em] text-[#2d3436]">Program:</span> {resumeContent.education.program}</p>
                    <p><span className="font-semibold uppercase tracking-[0.08em] text-[#2d3436]">Status:</span> {resumeContent.education.yearLabel} and still actively studying.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <NumberedPanel title="Current Learning Focus" items={resumeContent.education.currentFocus} icon={ScanLine} />
                  <NumberedPanel title="How I Learn" items={resumeContent.education.methods} icon={Wrench} />
                </div>
              </div>
            </ResumeSection>

            <ResumeSection title="Skills" icon={ScanLine} id="skills" collapsed={collapsedSections.skills} onToggle={() => toggleSection("skills")}>
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(340px,0.82fr)]">
                <div className="industrial-panel industrial-bolted rounded-[28px] p-5">
                  <div className="space-y-4">
                    {resumeContent.topSkills.map((skill) => (
                      <div key={skill.id} className="industrial-recessed rounded-[20px] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="industrial-label">{skill.label}</p>
                            <p className="mt-2 text-lg font-semibold text-[#2d3436]">{skill.score}/10</p>
                          </div>
                          <div className="industrial-chip industrial-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4a5568]">
                            calibrated score
                          </div>
                        </div>
                        <div className="industrial-meter mt-4">
                          <span style={{ width: `${Math.max(10, skill.score * 10)}%` }} />
                        </div>
                        <p className="mt-4 text-sm leading-7 text-[#4a5568]">{skill.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <NumberedPanel title={`Frontend Level: ${resumeContent.skillSummary.frontendLevel}`} items={resumeContent.skillSummary.frontendDetails} icon={PanelsTopLeft} />
                  <NumberedPanel title={`Backend Level: ${resumeContent.skillSummary.backendLevel}`} items={resumeContent.skillSummary.backendExperience} icon={Wrench} />
                  <NumberedPanel title="Tools" items={resumeContent.skillSummary.tools} icon={ShieldCheck} />
                  <NumberedPanel title="State Management" items={[...resumeContent.skillSummary.stateExperience, `Learning next: ${resumeContent.skillSummary.stateLearning.join(", ")}`]} icon={ScanLine} />
                </div>
              </div>
            </ResumeSection>

            <ResumeSection title="Playbook" icon={PanelsTopLeft} id="playbook" collapsed={collapsedSections.playbook} onToggle={() => toggleSection("playbook")}>
              <div className="grid gap-4 xl:grid-cols-2">
                <NumberedPanel title="Strengths" items={resumeContent.strengths} icon={ShieldCheck} />
                <NumberedPanel title="Learning Edges" items={resumeContent.weaknesses} icon={Wrench} />
                <NumberedPanel title="Decision Making" items={resumeContent.decisionMaking.process} description={resumeContent.decisionMaking.principle} icon={SquareChartGantt} />
                <NumberedPanel title={`Architecture: ${resumeContent.architecture.methodology}`} items={resumeContent.architecture.rules} description={resumeContent.architecture.influences.join(" / ")} icon={PanelsTopLeft} />
                <NumberedPanel title="Next 3 Months" items={resumeContent.goals.nearTerm} icon={ScanLine} />
                <NumberedPanel title="Next 1 Year" items={resumeContent.goals.longTerm} description={`Freelance: ${resumeContent.goals.preference.freelance ? "yes" : "no"} / Full-time: ${resumeContent.goals.preference.full_time}`} icon={ShieldCheck} />
              </div>
            </ResumeSection>

            <div className="resume-print-hidden industrial-panel industrial-bolted rounded-[24px] px-4 py-4 text-center">
              <p className="industrial-mono text-xs font-bold uppercase tracking-[0.16em] text-[#4a5568]">
                honest junior profile - real projects - no fake job history
              </p>
              <p className="mt-2 text-sm text-[#4a5568]">
                {briefStatus}
                {lastExternalSource ? ` Last external source: ${lastExternalSource}.` : ""}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
