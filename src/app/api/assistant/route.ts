import { NextResponse } from "next/server";

import { getProjectSections, getProfileProjects, getProfileBasics } from "@/shared/server/docs-data";

type AssistantRequest = {
  question: string;
};

function answerQuestion(question: string) {
  const lower = question.toLowerCase();
  const basics = getProfileBasics();
  const sections = getProjectSections();
  const projects = getProfileProjects();

  if (lower.includes("name") || lower.includes("who")) {
    return `${basics.name ?? "Maivand Rahmani"} — ${basics.title ?? "builder"}.`;
  }

  if (lower.includes("project") || lower.includes("portos")) {
    return sections[0]?.body || "PortOS is a browser-based portfolio operating system.";
  }

  if (lower.includes("portfolio") || lower.includes("projects")) {
    return projects.length > 0
      ? projects.map((project) => `${(project as { name?: string }).name ?? "Project"}`).join(", ")
      : "Project data is currently limited to PortOS.";
  }

  return "I can answer questions about Maivand, PortOS, and the documented project context.";
}

export async function POST(request: Request) {
  const payload = (await request.json()) as AssistantRequest;

  return NextResponse.json({ answer: answerQuestion(payload.question ?? "") });
}
