import { readFileSync } from "node:fs";
import path from "node:path";

import type { DocsDocument, DocsHeading } from "@/shared/lib/app-data/docs";
import { slugifyDocsHeading } from "@/shared/lib/app-data/docs";
import { getProfileBasics } from "@/shared/lib/app-data/project-data";

function readProjectReadme() {
  const filePath = path.join(process.cwd(), "docs/project/README");

  return readFileSync(filePath, "utf8");
}

function extractHeadings(content: string) {
  const matches = [...content.matchAll(/^(#{1,3})\s+(.+)$/gm)];

  return matches.map((match): DocsHeading => ({
    id: slugifyDocsHeading(match[2]),
    title: match[2].trim(),
    level: match[1].length,
  }));
}

function summarizeDocument(content: string) {
  const firstParagraph = content
    .split("\n\n")
    .map((chunk) => chunk.replace(/^#+\s+/gm, "").trim())
    .find(Boolean);

  return firstParagraph ?? "Documentation entry.";
}

function buildDocument(id: string, title: string, folder: string, pathName: string, content: string): DocsDocument {
  return {
    id,
    title,
    folder,
    path: pathName,
    content,
    summary: summarizeDocument(content),
    headings: extractHeadings(content),
  };
}

export function getDocsDocuments() {
  const projectReadme = readProjectReadme();
  const roadmapReadme = readFileSync(path.join(process.cwd(), "docs/roadmap/README.md"), "utf8");
  const roadmapAppsReadme = readFileSync(path.join(process.cwd(), "docs/roadmap/apps/README"), "utf8");
  const styleReadme = readFileSync(path.join(process.cwd(), "docs/style/README.md"), "utf8");
  const docsReadme = readFileSync(path.join(process.cwd(), "docs/README.md"), "utf8");

  return [
    buildDocument("docs-home", "Docs Overview", "docs", "docs/README.md", docsReadme),
    buildDocument("project-brief", "Project Brief", "project", "docs/project/README", projectReadme),
    buildDocument("roadmap", "Roadmap", "roadmap", "docs/roadmap/README.md", roadmapReadme),
    buildDocument("roadmap-apps", "Apps Roadmap", "roadmap/apps", "docs/roadmap/apps/README", roadmapAppsReadme),
    buildDocument("style-guide", "Style Guide", "style", "docs/style/README.md", styleReadme),
  ];
}

export { getProfileBasics };
