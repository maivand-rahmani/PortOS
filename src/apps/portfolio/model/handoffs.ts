import type { PortfolioHandoffTarget } from "@/shared/lib/portfolio-os-events";
import type { ResumeLensTarget, ResumeSectionTarget } from "@/shared/lib/resume-os-events";

type ProjectHandoffSeed = {
  title: string;
  summary: string;
  type: string;
  statusLabel: string;
  period: string;
  timeSpent: string;
  stack: string[];
  highlights: string[];
  challenges: string[];
  lessons: string[];
  tags: string[];
};

export type PortfolioProjectHandoff = {
  id: PortfolioHandoffTarget;
  label: string;
  audience: string;
  summary: string;
  outcomeLabel: string;
  recommendedResumeLens: ResumeLensTarget;
  recommendedResumeSection: ResumeSectionTarget;
  briefingPoints: string[];
  evidencePoints: string[];
  noteTitle: string;
  noteBody: string;
  agentTitle: string;
  agentPrompt: string;
  suggestions: string[];
};

function formatStack(stack: string[]) {
  if (stack.length === 0) {
    return "Stack details still being documented";
  }

  return stack.slice(0, 5).join(", ");
}

function pickTechnicalLens(project: ProjectHandoffSeed): ResumeLensTarget {
  const tokens = project.tags.map((tag) => tag.toLowerCase());

  if (tokens.includes("ai") || tokens.includes("system-design") || tokens.includes("product-architecture")) {
    return "ai";
  }

  return "frontend";
}

function buildNoteBody(project: ProjectHandoffSeed, handoff: Omit<PortfolioProjectHandoff, "noteBody">) {
  return [
    `${handoff.label} handoff for ${project.title}`,
    `Audience: ${handoff.audience}`,
    `Target outcome: ${handoff.outcomeLabel}`,
    `Status: ${project.statusLabel}`,
    `Timeline: ${project.period}`,
    `Build window: ${project.timeSpent}`,
    "",
    "Positioning:",
    handoff.summary,
    "",
    "Key points:",
    ...handoff.briefingPoints.map((point, index) => `${index + 1}. ${point}`),
    "",
    "Evidence:",
    ...handoff.evidencePoints.map((point, index) => `${index + 1}. ${point}`),
    "",
    `Relevant stack: ${formatStack(project.stack)}`,
  ].join("\n");
}

export function buildProjectHandoffs(project: ProjectHandoffSeed): PortfolioProjectHandoff[] {
  const topHighlight = project.highlights[0] ?? project.summary;
  const secondHighlight = project.highlights[1] ?? project.lessons[0] ?? project.summary;
  const topChallenge = project.challenges[0] ?? project.lessons[0] ?? "Active technical trade-offs are documented inside the case study.";
  const stackSummary = formatStack(project.stack);
  const technicalLens = pickTechnicalLens(project);

  const recruiter = {
    id: "recruiter" as const,
    label: "Recruiter Brief",
    audience: "Recruiter / hiring manager",
    summary: `Fast qualification view for ${project.title}, focused on scope, delivery evidence, and where it proves product engineering maturity.`,
    outcomeLabel: "shortlisting signal",
    recommendedResumeLens: "balanced" as const,
    recommendedResumeSection: "timeline" as const,
    briefingPoints: [
      `${project.title} is presented as a ${project.type.toLowerCase()} with ${project.statusLabel.toLowerCase()} delivery status.`,
      `The project shows hands-on work across ${stackSummary}.`,
      `Best proof point: ${topHighlight}`,
      `Growth edge discussed honestly: ${topChallenge}`,
    ],
    evidencePoints: [topHighlight, secondHighlight, project.lessons[0] ?? "Clear reasoning around architecture and iteration."],
    noteTitle: `${project.title} - recruiter handoff`,
    agentTitle: `${project.title} recruiter brief`,
    agentPrompt: `Create a recruiter-ready summary for ${project.title}. Focus on role fit, stack relevance, delivery scope, and why this project is credible evidence for hiring. Include one honest growth edge and one strong interview angle.`,
    suggestions: [
      `Which role profile fits ${project.title} best?`,
      `What interview questions could ${project.title} support?`,
      `Open resume evidence for ${project.title}.`,
    ],
  };

  const client = {
    id: "client" as const,
    label: "Client Handoff",
    audience: "Client / product stakeholder",
    summary: `Client-facing brief for ${project.title}, oriented around value, decision-making, and how the build translates into a dependable product engagement.`,
    outcomeLabel: "project-fit conversation",
    recommendedResumeLens: "growth" as const,
    recommendedResumeSection: "overview" as const,
    briefingPoints: [
      `The build is framed around practical product value rather than decorative UI.`,
      `Key outcome signal: ${topHighlight}`,
      `It reflects comfort shipping with ${stackSummary}.`,
      `Technical risk awareness is visible through ${topChallenge}`,
    ],
    evidencePoints: [project.summary, topHighlight, project.lessons[1] ?? project.lessons[0] ?? "Clear communication around trade-offs and iteration."],
    noteTitle: `${project.title} - client handoff`,
    agentTitle: `${project.title} client brief`,
    agentPrompt: `Turn ${project.title} into a client-facing project brief. Explain the product value, technical credibility, likely collaboration style, and why this project suggests good freelance or contract fit. Keep the tone practical and concise.`,
    suggestions: [
      `What kind of client work aligns with ${project.title}?`,
      `How would you pitch ${project.title} in a discovery call?`,
      `What follow-up evidence should be shown after ${project.title}?`,
    ],
  };

  const technical = {
    id: "technical" as const,
    label: "Technical Handoff",
    audience: "Engineer / technical reviewer",
    summary: `Technical reviewer brief for ${project.title}, centered on architecture, implementation depth, and the hard problems that make the case study worth inspecting.`,
    outcomeLabel: "deep-dive discussion",
    recommendedResumeLens: technicalLens,
    recommendedResumeSection: "skills" as const,
    briefingPoints: [
      `Architecture signal: ${project.lessons[0] ?? topHighlight}`,
      `Primary implementation proof: ${topHighlight}`,
      `Constraint handled: ${topChallenge}`,
      `Relevant technical surface area: ${stackSummary}`,
    ],
    evidencePoints: [topHighlight, topChallenge, project.lessons[2] ?? project.lessons[1] ?? project.summary],
    noteTitle: `${project.title} - technical handoff`,
    agentTitle: `${project.title} technical brief`,
    agentPrompt: `Prepare a technical handoff for ${project.title}. Focus on architecture decisions, implementation trade-offs, stack choices, and the most important engineering discussion points. Call out one likely question a senior engineer would ask.`,
    suggestions: [
      `What architecture decisions matter most in ${project.title}?`,
      `Which trade-offs should I explain for ${project.title}?`,
      `Summarize ${project.title} for a technical interviewer.`,
    ],
  };

  return [recruiter, client, technical].map((handoff) => ({
    ...handoff,
    noteBody: buildNoteBody(project, handoff),
  }));
}
