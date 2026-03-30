import maivandInfo from "../../../../docs/maivand/info.json";
import portfolioInfo from "../../../../docs/maivand/projects/info.json";
import portfolioPresentation from "../../../../docs/maivand/projects/portfolio.json";

import { buildProjectHandoffs, type PortfolioProjectHandoff } from "./handoffs";

export type { PortfolioProjectHandoff } from "./handoffs";

type ProfileProject = {
  name: string;
  type?: string;
  description?: string;
  stack?: string[];
  key_challenges?: string[];
  what_learned?: string[];
  focus?: string[];
  level?: string;
  time_spent?: string;
  started?: string;
  finished?: string;
  status?: string;
  notes?: string;
};

type ProfileInfo = {
  projects: ProfileProject[];
};

type CatalogProject = {
  name: string;
  slug: string;
  description?: string;
  status?: string;
  type?: string;
  portfolioReady?: boolean;
  summary?: {
    short?: string;
    long?: string;
  };
  repository?: {
    url?: string;
  };
  urls?: {
    live?: string;
  };
  coreFeatures?: string[];
  highlights?: string[];
  opportunities?: string[];
  tags?: string[];
  techStack?: {
    frontend?: string[];
    backend?: string[];
    styling?: string[];
    uiLibraries?: string[];
  };
  aiContext?: {
    maturity?: string;
  };
};

type CatalogInfo = Record<string, CatalogProject>;

type PortfolioPresentationEntry = {
  id: string;
  source: "catalog" | "profile";
  sourceId: string;
  profileSourceName?: string;
  featured: boolean;
  sortOrder: number;
  category: string;
  heroLabel: string;
  summary: string;
  accent: string;
  tags: string[];
  gallery: Array<{
    src: string;
    alt: string;
    label: string;
  }>;
};

type PortfolioPresentationData = {
  projects: PortfolioPresentationEntry[];
};

export type PortfolioProjectImage = {
  src: string;
  alt: string;
  label: string;
};

export type PortfolioProjectLink = {
  label: string;
  href: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  heroLabel: string;
  summary: string;
  description: string;
  type: string;
  status: string;
  statusLabel: string;
  period: string;
  timeSpent: string;
  accent: string;
  featured: boolean;
  tags: string[];
  stack: string[];
  highlights: string[];
  challenges: string[];
  lessons: string[];
  gallery: PortfolioProjectImage[];
  links: PortfolioProjectLink[];
  filterTokens: string[];
  handoffs: PortfolioProjectHandoff[];
};

const profile = maivandInfo as ProfileInfo;
const catalog = portfolioInfo as CatalogInfo;
const presentation = portfolioPresentation as PortfolioPresentationData;

function createPeriodLabel(project: ProfileProject | undefined) {
  if (!project?.started && !project?.finished) {
    return "Timeline pending";
  }

  const started = project.started ?? "Unknown";
  const finished = project.finished ?? "Present";

  return `${started} -> ${finished}`;
}

function normalizeStatus(status: string | undefined) {
  const value = (status ?? "unknown").toLowerCase();

  if (value.includes("progress")) {
    return { id: "in-progress", label: "In Progress" };
  }

  if (value.includes("complete") || value.includes("active")) {
    return { id: "completed", label: "Completed" };
  }

  return { id: "active", label: status ?? "Active" };
}

function unique(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function normalizeCatalogProject(
  entry: PortfolioPresentationEntry,
  source: CatalogProject,
  profileProject: ProfileProject | undefined,
): PortfolioProject {
  const status = normalizeStatus(profileProject?.status ?? source.status);
  const stack = unique([
    ...(profileProject?.stack ?? []),
    ...(source.techStack?.frontend ?? []),
    ...(source.techStack?.backend ?? []),
    ...(source.techStack?.styling ?? []),
    ...(source.techStack?.uiLibraries ?? []),
  ]);

  const description =
    source.summary?.long ??
    source.description ??
    profileProject?.description ??
    entry.summary;

  const highlights = source.highlights?.slice(0, 4) ?? source.coreFeatures?.slice(0, 4) ?? [];
  const challenges = profileProject?.key_challenges?.slice(0, 4) ?? source.opportunities?.slice(0, 4) ?? [];
  const lessons = profileProject?.what_learned?.slice(0, 4) ?? highlights;

  return {
    id: entry.id,
    title: source.name,
    heroLabel: entry.heroLabel,
    summary: entry.summary,
    description,
    type: entry.category,
    status: status.id,
    statusLabel: status.label,
    period: createPeriodLabel(profileProject),
    timeSpent: profileProject?.time_spent ?? source.aiContext?.maturity ?? "Long-term build",
    accent: entry.accent,
    featured: entry.featured,
    tags: unique([...(entry.tags ?? []), ...(source.tags ?? [])]),
    stack,
    highlights,
    challenges,
    lessons,
    gallery: entry.gallery,
    links: [
      ...(source.urls?.live ? [{ label: "Live Demo", href: source.urls.live }] : []),
      ...(source.repository?.url ? [{ label: "Repository", href: source.repository.url }] : []),
    ],
    filterTokens: unique([
      entry.category.toLowerCase(),
      status.id,
      ...(entry.tags ?? []).map((tag) => tag.toLowerCase()),
      ...(source.tags ?? []).map((tag) => tag.toLowerCase()),
      ...stack.map((tag) => tag.toLowerCase()),
    ]),
    handoffs: [],
  };
}

function normalizeProfileProject(
  entry: PortfolioPresentationEntry,
  source: ProfileProject,
): PortfolioProject {
  const status = normalizeStatus(source.status);

  return {
    id: entry.id,
    title: source.name,
    heroLabel: entry.heroLabel,
    summary: entry.summary,
    description: source.description ?? entry.summary,
    type: entry.category,
    status: status.id,
    statusLabel: status.label,
    period: createPeriodLabel(source),
    timeSpent: source.time_spent ?? source.notes ?? "In active development",
    accent: entry.accent,
    featured: entry.featured,
    tags: unique(entry.tags),
    stack: unique(source.stack ?? ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand"]),
    highlights: source.focus?.slice(0, 4) ?? ["System design", "AI integration", "Product architecture"],
    challenges: [source.notes ?? "Turning a portfolio into a working system instead of a static page."],
    lessons: [
      "Build apps as isolated modules inside a controlled runtime.",
      "Treat portfolio UI like a product, not a brochure.",
      "Keep architecture readable while features grow.",
    ],
    gallery: entry.gallery,
    links: [],
    filterTokens: unique([
      entry.category.toLowerCase(),
      status.id,
      ...entry.tags.map((tag) => tag.toLowerCase()),
      ...(source.stack ?? []).map((tag) => tag.toLowerCase()),
    ]),
    handoffs: [],
  };
}

function normalizeProject(entry: PortfolioPresentationEntry) {
  if (entry.source === "catalog") {
    const source = catalog[entry.sourceId];
    const profileProject = profile.projects.find((project) => project.name === entry.profileSourceName);

    if (!source) {
      throw new Error(`Missing catalog project for portfolio entry: ${entry.sourceId}`);
    }

    return normalizeCatalogProject(entry, source, profileProject);
  }

  const source = profile.projects.find((project) => project.name === entry.sourceId);

  if (!source) {
    throw new Error(`Missing profile project for portfolio entry: ${entry.sourceId}`);
  }

  return normalizeProfileProject(entry, source);
}

export const portfolioProjects = presentation.projects
  .slice()
  .sort((left, right) => left.sortOrder - right.sortOrder)
  .map(normalizeProject)
  .map((project) => ({
    ...project,
    handoffs: buildProjectHandoffs(project),
  }));

export const portfolioFilters = unique([
  "all",
  "featured",
  ...portfolioProjects.map((project) => project.status),
  ...portfolioProjects.flatMap((project) => project.tags),
]).map((filter) => ({
  id: filter,
  label:
    filter === "all"
      ? "All"
      : filter === "featured"
        ? "Featured"
        : filter
            .replace(/-/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
}));
