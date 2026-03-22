import { readFileSync } from "node:fs";
import path from "node:path";

import { getProfileBasics, getProfileProjects } from "@/shared/lib";

function readProjectReadme() {
  const filePath = path.join(process.cwd(), "docs/project/README");

  return readFileSync(filePath, "utf8");
}

export function getProjectSections() {
  const projectDocumentation = readProjectReadme();
  const sections = projectDocumentation
    .split(/^##\s+/m)
    .map((section) => section.trim())
    .filter(Boolean);

  if (sections.length === 0) {
    return [];
  }

  return sections.map((section, index) => {
    const [title, ...bodyParts] = section.split("\n");

    if (index === 0 && !projectDocumentation.trim().startsWith("##")) {
      return { title: "Overview", body: section };
    }

    return {
      title: title.trim(),
      body: bodyParts.join("\n").trim(),
    };
  });
}

export { getProfileBasics, getProfileProjects };
