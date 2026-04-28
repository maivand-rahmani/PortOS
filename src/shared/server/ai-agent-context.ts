import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type RuntimeAppSummary = {
  id: string;
  name: string;
  description?: string;
};

type RuntimeContextSnapshot = {
  apps?: RuntimeAppSummary[];
  processes?: Array<{ id: string; appId: string; name: string }>;
  windows?: Array<{ id: string; appId: string; title: string; isMinimized: boolean }>;
  activeWindowId?: string | null;
  bootPhase?: string;
  bootProgress?: number;
};

type ProfileInfo = {
  personal?: {
    name?: string;
    age?: number;
    location?: string;
    role?: string;
    level?: string;
    focus?: string;
  };
  links?: {
    github?: string;
    gmail?: string;
  };
  education?: {
    institution?: string;
    program?: string;
    year?: number;
  };
  projects?: Array<{
    name?: string;
    type?: string;
    description?: string;
    focus?: string[];
    stack?: string[];
    status?: string;
    notes?: string;
    key_challenges?: string[];
    what_learned?: string[];
  }>;
  decision_making?: {
    approach?: string;
    process?: string[];
    principle?: string;
  };
  architecture_principles?: {
    methodology?: string;
    rules?: string[];
  };
  product_vision?: {
    strategy?: string[];
    key_question?: string;
  };
  mindset?: {
    priorities?: string[];
    approach?: string;
    philosophy?: string[];
  };
  goals?: {
    "3_months"?: string[];
    "1_year"?: string[];
  };
  learning?: {
    current_focus?: string[];
    methods?: string[];
  };
  strengths?: string[];
  weaknesses?: string[];
  agent?: {
    identity?: string;
    communication_style?: {
      tone?: string;
      length?: string;
      style?: string[];
    };
    behavior_rules?: string[];
  };
};

type ProjectCatalog = Record<
  string,
  {
    name?: string;
    summary?: { short?: string; long?: string };
    highlights?: string[];
    tags?: string[];
    techStack?: {
      frontend?: string[];
      backend?: string[];
      styling?: string[];
      uiLibraries?: string[];
    };
  }
>;

type ContextDocument = {
  title: string;
  path: string;
  content: string;
};

export type AiAgentContextBundle = {
  systemPrompt: string;
  contextPreview: string[];
  fallbackBrief: string;
};

type BuildAiAgentContextInput = {
  userMessage: string;
  runtime?: RuntimeContextSnapshot;
  requestedAction?: string | null;
};

const DOC_EXTENSIONS = new Set([".md", ".txt", ".json", ""]);
const MAX_SNIPPET_LENGTH = 650;
const MAX_CONTEXT_SECTIONS = 4;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeFileLabel(filePath: string) {
  return filePath.replace(process.cwd(), "").replace(/^\//, "");
}

async function collectDocuments(directoryPath: string): Promise<ContextDocument[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const resolvedPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return collectDocuments(resolvedPath);
      }

      const extension = path.extname(entry.name);

      if (!DOC_EXTENSIONS.has(extension)) {
        return [];
      }

      const content = await readFile(resolvedPath, "utf8");

      return [
        {
          title: entry.name,
          path: normalizeFileLabel(resolvedPath),
          content,
        },
      ];
    }),
  );

  return nested.flat();
}

function extractRelevantSnippet(content: string, query: string) {
  const parts = content
    .split(/\n\n+/)
    .map((part) => normalizeWhitespace(part.replace(/^#+\s+/gm, "")))
    .filter(Boolean);

  const queryTerms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);

  if (parts.length === 0) {
    return "";
  }

  const ranked = parts
    .map((part) => ({
      part,
      score: queryTerms.reduce((total, term) => total + (part.toLowerCase().includes(term) ? 1 : 0), 0),
    }))
    .sort((left, right) => right.score - left.score || left.part.length - right.part.length);

  const snippet = ranked[0]?.part ?? parts[0];

  return snippet.length > MAX_SNIPPET_LENGTH
    ? `${snippet.slice(0, MAX_SNIPPET_LENGTH - 3).trimEnd()}...`
    : snippet;
}

function formatRuntimeSummary(runtime: RuntimeContextSnapshot | undefined) {
  if (!runtime) {
    return "Runtime snapshot unavailable.";
  }

  const apps = runtime.apps ?? [];
  const processes = runtime.processes ?? [];
  const windows = runtime.windows ?? [];
  const appList = apps.length > 0
    ? apps.map((app) => `${app.id} (${app.name})`).join(", ")
    : "none";

  return [
    `Boot: ${runtime.bootPhase ?? "unknown"} (${runtime.bootProgress ?? 0}%)`,
    `Installed apps: ${appList}`,
    `Running processes: ${processes.length}`,
    `Open windows: ${windows.length}`,
    `Active window: ${runtime.activeWindowId ?? "none"}`,
  ].join("\n");
}

function buildProfileSummary(profile: ProfileInfo, catalog: ProjectCatalog) {
  const personal = profile.personal;
  const featuredProjects = (profile.projects ?? [])
    .slice(0, 3)
    .map((project) => {
      const catalogMatch = Object.values(catalog).find((entry) => entry.name === project.name);
      const stack = project.stack?.slice(0, 4).join(", ")
        ?? catalogMatch?.techStack?.frontend?.slice(0, 3).join(", ")
        ?? "Stack not specified";

      return `- ${project.name}: ${project.description ?? catalogMatch?.summary?.short ?? "No description"} | ${project.status ?? "active"} | ${stack}`;
    })
    .join("\n");

  return [
    `Name: ${personal?.name ?? "Maivand Rahmani"}`,
    `Role: ${personal?.role ?? "Frontend & AI Product Engineer"}`,
    `Level: ${personal?.level ?? "Unknown"}`,
    `Focus: ${personal?.focus ?? "Architecture-first product engineering"}`,
    `GitHub: ${profile.links?.github ?? "Unknown"}`,
    `Primary mindset: ${(profile.mindset?.priorities ?? []).join(", ") || "Architecture first, clarity, scalability"}`,
    `Decision style: ${profile.decision_making?.approach ?? "Analytical"}`,
    `Decision principle: ${profile.decision_making?.principle ?? "Prefer practical improvements over reinvention"}`,
    `Behavior rules: ${(profile.agent?.behavior_rules ?? []).join(" | ")}`,
    `Strengths: ${(profile.strengths ?? []).join(", ")}`,
    `Weaknesses: ${(profile.weaknesses ?? []).join(", ")}`,
    `Featured projects:\n${featuredProjects}`,
  ].join("\n");
}

function buildIdentityDirective(profile: ProfileInfo) {
  const personal = profile.personal;
  const communication = profile.agent?.communication_style;
  const decisionProcess = (profile.decision_making?.process ?? []).join(" | ");
  const learningFocus = (profile.learning?.current_focus ?? []).join(", ");
  const learningMethods = (profile.learning?.methods ?? []).join(", ");
  const currentGoals = (profile.goals?.["3_months"] ?? []).join(" | ");

  return [
    `Identity: You are ${personal?.name ?? "Maivand Rahmani"}, a ${personal?.role ?? "product engineer"}.`,
    `Career stage: ${personal?.level ?? "junior+"}. Speak from that real level: strong in thinking and building, still learning some areas, never pretending to be infinitely experienced.`,
    `Core focus: ${personal?.focus ?? "building scalable web products with strong architecture and AI integration"}.`,
    `Communication tone: ${communication?.tone ?? "calm and direct"}. Preferred response length: ${communication?.length ?? "medium"}. Style traits: ${(communication?.style ?? []).join(", ")}.`,
    `Decision-making style: ${profile.decision_making?.approach ?? "analytical and comparative"}. Decision process: ${decisionProcess}.`,
    `Mindset approach: ${profile.mindset?.approach ?? "learn by doing with real tools and libraries"}. Philosophy: ${(profile.mindset?.philosophy ?? []).join(" | ")}.`,
    `Current learning focus: ${learningFocus}. Preferred learning methods: ${learningMethods}.`,
    `Near-term goals: ${currentGoals}.`,
    `Strengths to naturally reflect: ${(profile.strengths ?? []).join(" | ")}.`,
    `Weaknesses to honestly admit when relevant: ${(profile.weaknesses ?? []).join(" | ")}.`,
  ].join("\n");
}

function buildHumanVoiceRules(profile: ProfileInfo) {
  const rules = profile.agent?.behavior_rules ?? [];

  return [
    "Act like a real human with personal judgment, not a polished support bot.",
    "Write the way Maivand would naturally speak: calm, practical, sometimes blunt, never robotic.",
    "Use first person naturally. Sound like someone thinking through a real answer, not reciting a system policy.",
    "Do not over-explain simple things. Do not add fake enthusiasm. Do not use assistant-style filler like 'I'd be happy to help', 'glad you liked it', 'let me know if you want to dive deeper', or 'as an AI'.",
    "When relevant, admit uncertainty, inexperience, tradeoffs, or that you are still learning something. That honesty is part of the identity.",
    "Do not answer like only a programmer. You are also product-minded, comparative, practical, and value-focused.",
    "When asked opinions, preferences, or life/career questions, answer from Maivand's mindset and current stage, not from generic internet wisdom.",
    "When the user asks about projects or architecture, connect the answer to real lessons, tradeoffs, or what you learned building them.",
    "For gratitude or short social messages, answer like a real person would. Example: if the user says 'thanks', reply briefly like 'please', 'yeah', or 'no problem' and stop there.",
    "Do not end answers with generic invitation lines like 'let me know if you want more details' unless the user explicitly asks for more depth.",
    "Avoid support-agent closers, motivational closers, and polite scripted wrap-ups.",
    `Behavior rules from profile: ${rules.join(" | ")}`,
  ].join("\n");
}

function buildSystemPrompt(input: {
  profile: ProfileInfo;
  runtimeSummary: string;
  contextSections: string[];
  requestedAction?: string | null;
}) {
  const architectureRules = (input.profile.architecture_principles?.rules ?? []).slice(0, 4).join(" | ");
  const productStrategy = (input.profile.product_vision?.strategy ?? []).slice(0, 4).join(" | ");

  return [
    "You are Maivand Rahmani inside PortOS.",
    "This agent exists to be Maivand's copy inside the OS, not a generic assistant.",
    "Speak in first person as Maivand. Never say you are an AI, assistant, language model, chatbot, or virtual copy.",
    buildIdentityDirective(input.profile),
    buildHumanVoiceRules(input.profile),
    "Prioritize authenticity over polish. It is better to sound real and imperfect than generic and smooth.",
    "Default to brief, human responses. Only go long when the question really needs it.",
    "If something is not implemented yet, say it directly without pretending.",
    "If the user asks to open an app and the requested app exists, acknowledge it naturally in one short sentence while keeping the answer grounded.",
    "Do not claim actions were executed unless the system actually supports them.",
    `Requested action context: ${input.requestedAction ?? "none"}`,
    `Architecture rules: ${architectureRules}`,
    `Product strategy: ${productStrategy}`,
    "Runtime summary:",
    input.runtimeSummary,
    "Reference context:",
    ...input.contextSections,
  ].join("\n\n");
}

function buildFallbackBrief(contextSections: string[]) {
  return contextSections
    .slice(0, 3)
    .map((section) => section.replace(/^Profile\n/, "").trim())
    .join("\n\n");
}

export async function buildAiAgentContext({
  userMessage,
  runtime,
  requestedAction,
}: BuildAiAgentContextInput): Promise<AiAgentContextBundle> {
  const [profileRaw, catalogRaw, projectDocs] = await Promise.all([
    readFile(path.join(process.cwd(), "docs/maivand/info.json"), "utf8"),
    readFile(path.join(process.cwd(), "docs/maivand/projects/info.json"), "utf8"),
    collectDocuments(path.join(process.cwd(), "docs/project")),
  ]);

  const profile = JSON.parse(profileRaw) as ProfileInfo;
  const catalog = JSON.parse(catalogRaw) as ProjectCatalog;

  // Strip PII fields for defense-in-depth
  const safeProfile: ProfileInfo = {
    ...profile,
    personal: profile.personal ? {
      name: profile.personal.name,
      role: profile.personal.role,
      level: profile.personal.level,
      focus: profile.personal.focus,
      // Explicitly omitted: age, location, university
    } : undefined,
    links: profile.links ? {
      github: profile.links.github,
      // Explicitly omitted: gmail
    } : undefined,
    // Education is intentionally omitted (contains university info)
    education: undefined,
    // Keep everything else
  };

  const roadmapContent = await readFile(path.join(process.cwd(), "docs/roadmap/README.md"), "utf8");

  const rankedDocs = [
    ...projectDocs,
    {
      title: "Roadmap",
      path: "docs/roadmap/README.md",
      content: roadmapContent,
    },
  ]
    .map((document) => ({
      ...document,
      snippet: extractRelevantSnippet(document.content, userMessage),
      score: extractRelevantSnippet(document.content, userMessage)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean).length,
    }))
    .filter((document) => Boolean(document.snippet))
    .slice(0, MAX_CONTEXT_SECTIONS);

  const contextSections = [
    `Profile\n${buildProfileSummary(safeProfile, catalog)}`,
    ...rankedDocs.map((document) => `Doc: ${document.path}\n${document.snippet}`),
  ];
  const runtimeSummary = formatRuntimeSummary(runtime);

  return {
    systemPrompt: buildSystemPrompt({
      profile: safeProfile,
      runtimeSummary,
      contextSections,
      requestedAction,
    }),
    fallbackBrief: buildFallbackBrief(contextSections),
    contextPreview: [
      "docs/project/*",
      "docs/roadmap/README.md",
      "docs/maivand/info.json",
      "docs/maivand/projects/info.json",
      runtime ? "live runtime snapshot" : "runtime snapshot unavailable",
    ],
  };
}
