import maivandInfo from "../../../../docs/maivand/info.json";
import projectsInfo from "../../../../docs/maivand/projects/info.json";

type RawProfileProject = {
  name: string;
  type?: string;
  description?: string;
  stack?: string[];
  level?: string;
  focus?: string[];
};

type RawDetailedProject = {
  name: string;
  slug: string;
  status?: string;
  type?: string;
  summary?: {
    short?: string;
    long?: string;
  };
  coreFeatures?: string[];
  highlights?: string[];
  techStack?: {
    frontend?: string[];
    backend?: string[];
    styling?: string[];
    authentication?: string[];
  };
  repository?: {
    url?: string;
  };
  urls?: {
    live?: string;
  };
};

type RawProfileInfo = {
  personal: {
    name: string;
    age: number;
    location: string;
    role: string;
    level: string;
    focus: string;
  };
  links?: {
    github?: string;
    gmail?: string;
  };
  education: {
    institution: string;
    program: string;
    year: number;
  };
  skills: {
    frontend: {
      core: Record<string, string>;
      level: string;
      details: string[];
    };
    backend: {
      level: string;
      experience: string[];
    };
    state_management: {
      experience: string[];
      not_used_yet: string[];
    };
    tools: string[];
  };
  projects: RawProfileProject[];
  decision_making: {
    approach: string;
    process: string[];
    principle: string;
  };
  architecture_principles: {
    methodology: string;
    rules: string[];
    influences: string[];
  };
  goals: {
    "3_months": string[];
    "1_year": string[];
    preferences: {
      freelance: boolean;
      full_time: string;
      products: string;
    };
  };
  learning: {
    current_focus: string[];
    methods: string[];
  };
  strengths: string[];
  weaknesses: string[];
};

type RawProjectsCatalog = Record<string, RawDetailedProject>;

export type ResumeSectionId = "overview" | "timeline" | "education" | "skills" | "playbook";

export type ResumeLink = {
  label: string;
  href: string;
  value: string;
};

export type ResumeTimelineProject = {
  id: string;
  badge: string;
  title: string;
  type: string;
  description: string;
  detail: string;
  stack: string[];
  highlights: string[];
  repoUrl?: string;
  liveUrl?: string;
};

export type ResumeSkill = {
  id: string;
  label: string;
  score: number;
  note: string;
};

const profile = maivandInfo as RawProfileInfo;
const projectCatalog = projectsInfo as RawProjectsCatalog;

function formatSkillLabel(key: string) {
  const normalized = key.replace(/_/g, " ");

  if (normalized.toLowerCase() === "html css") {
    return "HTML/CSS";
  }

  if (normalized.toLowerCase() === "nextjs") {
    return "Next.js";
  }

  if (normalized.toLowerCase() === "ai tools") {
    return "AI Tools";
  }

  if (normalized.toLowerCase() === "git") {
    return "Git";
  }

  if (normalized.toLowerCase() === "tailwind") {
    return "Tailwind";
  }

  if (normalized.toLowerCase() === "ui design") {
    return "UI Design";
  }

  if (normalized.toLowerCase() === "design patterns") {
    return "Design Patterns";
  }

  if (normalized.toLowerCase() === "system design") {
    return "System Design";
  }

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractSkillScore(value: string) {
  const match = value.match(/(\d+)\/10/);
  return match ? Number(match[1]) : 0;
}

function extractSkillNote(value: string) {
  return value.replace(/\s*\d+\/10\s*/g, "").trim();
}

function buildDetailedTimelineProject(project: RawDetailedProject): ResumeTimelineProject {
  const stack = [
    ...(project.techStack?.frontend ?? []),
    ...(project.techStack?.backend ?? []),
    ...(project.techStack?.styling ?? []),
  ].filter((value, index, current) => current.indexOf(value) === index);

  return {
    id: project.slug,
    badge: "Project 02",
    title: project.name,
    type: project.type ?? "product",
    description: project.summary?.short ?? project.summary?.long ?? "",
    detail:
      project.summary?.long ??
      "A production-style build focused on architecture, product systems, and real-world complexity.",
    stack,
    highlights: (project.highlights ?? project.coreFeatures ?? []).slice(0, 4),
    repoUrl: project.repository?.url,
    liveUrl: project.urls?.live,
  };
}

function buildProfileTimelineProject(project: RawProfileProject): ResumeTimelineProject {
  const highlights = [
    ...(project.description?.toLowerCase().includes("model selection") ? ["Model selection"] : []),
    ...(project.description?.toLowerCase().includes("persistent memory") ? ["Persistent memory"] : []),
    ...(project.description?.toLowerCase().includes("parameter control") ? ["Parameter control"] : []),
  ];

  return {
    id: project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    badge: "Project 01",
    title: project.name,
    type: project.type ?? "project",
    description: project.description ?? "A practical project used to sharpen product and frontend thinking.",
    detail:
      "One of the early serious builds used to move from simple UI work into product thinking, state handling, and AI-assisted workflows.",
    stack: project.stack ?? [],
    highlights: highlights.length > 0 ? highlights : ["Interactive UI", "Real product flow", "Local persistence"],
  };
}

const profileProjects = profile.projects;
const chatClientProject = profileProjects.find((project) => project.name === "Custom ChatGPT Client");
const commerceProject = projectCatalog["crazy-ecommerce-project"];

const coreSkills = Object.entries(profile.skills.frontend.core)
  .map(([key, value]) => ({
    id: key,
    label: formatSkillLabel(key),
    score: extractSkillScore(value),
    note: extractSkillNote(value),
  }))
  .sort((left, right) => right.score - left.score);

export const resumeContent = {
  profile: {
    name: profile.personal.name,
    role: profile.personal.role,
    level: profile.personal.level,
    location: profile.personal.location,
    age: profile.personal.age,
    focus: profile.personal.focus,
    journey: "1.5 years into programming, still studying, building toward a first real product engineering role.",
    studyStatus: `Year ${profile.education.year} student in ${profile.education.program}`,
  },
  links: [
    ...(profile.links?.github
      ? [
          {
            label: "GitHub",
            href: profile.links.github,
            value: profile.links.github.replace("https://", ""),
          } satisfies ResumeLink,
        ]
      : []),
    ...(profile.links?.gmail
      ? [
          {
            label: "Email",
            href: `mailto:${profile.links.gmail}`,
            value: profile.links.gmail,
          } satisfies ResumeLink,
        ]
      : []),
  ],
  timeline: [
    ...(chatClientProject ? [buildProfileTimelineProject(chatClientProject)] : []),
    ...(commerceProject ? [buildDetailedTimelineProject(commerceProject)] : []),
  ],
  education: {
    institution: profile.education.institution,
    program: profile.education.program,
    yearLabel: `Year ${profile.education.year}`,
    currentFocus: profile.learning.current_focus,
    methods: profile.learning.methods,
  },
  skillSummary: {
    frontendLevel: profile.skills.frontend.level,
    frontendDetails: profile.skills.frontend.details,
    backendLevel: profile.skills.backend.level,
    backendExperience: profile.skills.backend.experience,
    stateExperience: profile.skills.state_management.experience,
    stateLearning: profile.skills.state_management.not_used_yet,
    tools: profile.skills.tools,
  },
  topSkills: coreSkills.slice(0, 8),
  strengths: profile.strengths,
  weaknesses: profile.weaknesses,
  goals: {
    nearTerm: profile.goals["3_months"],
    longTerm: profile.goals["1_year"],
    preference: profile.goals.preferences,
  },
  decisionMaking: profile.decision_making,
  architecture: profile.architecture_principles,
};
