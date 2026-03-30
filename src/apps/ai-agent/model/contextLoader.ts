import type { AppCommandAction, ParsedCommand } from "./commandParser";

export type AgentChatRole = "user" | "assistant" | "system";

export type AgentChatMessage = {
  id: string;
  role: AgentChatRole;
  content: string;
  createdAt: string;
  sources?: string[];
  action?: AppCommandAction | null;
};

export type AgentRuntimeSnapshot = {
  apps: Array<{ id: string; name: string; description: string }>;
  processes: Array<{ id: string; appId: string; name: string }>;
  windows: Array<{ id: string; appId: string; title: string; isMinimized: boolean }>;
  activeWindowId: string | null;
  bootPhase: string;
  bootProgress: number;
};

const AI_AGENT_STORAGE_KEY = "portos-ai-agent-history";
const MAX_PERSISTED_MESSAGES = 24;

function createTimestamp() {
  return new Date().toISOString();
}

function createMessage(
  role: AgentChatRole,
  content: string,
  extras: Partial<Pick<AgentChatMessage, "sources" | "action">> = {},
): AgentChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: createTimestamp(),
    sources: extras.sources,
    action: extras.action,
  };
}

export function createAssistantMessage(
  content: string,
  extras: Partial<Pick<AgentChatMessage, "sources" | "action">> = {},
) {
  return createMessage("assistant", content, extras);
}

export function createUserMessage(content: string) {
  return createMessage("user", content);
}

export function createSystemMessage(content: string) {
  return createMessage("system", content);
}

export function createWelcomeMessages() {
  return [
    createAssistantMessage(
      "I handle the portfolio, projects, hiring flow, and runtime from inside PortOS. Ask what I build, why you should hire me, let me run a live portfolio walkthrough, or tell me to open an app.",
      {
        sources: ["docs/project", "docs/maivand/info.json"],
      },
    ),
    createSystemMessage("Try: why should I hire you, run a live portfolio walkthrough, or I want to contact you."),
  ];
}

export function clearAgentHistory() {
  if (typeof window === "undefined") {
    return createWelcomeMessages();
  }

  window.localStorage.removeItem(AI_AGENT_STORAGE_KEY);

  return createWelcomeMessages();
}

export function readStoredAgentHistory() {
  if (typeof window === "undefined") {
    return createWelcomeMessages();
  }

  const stored = window.localStorage.getItem(AI_AGENT_STORAGE_KEY);

  if (!stored) {
    return createWelcomeMessages();
  }

  try {
    const parsed = JSON.parse(stored) as AgentChatMessage[];

    return parsed.length > 0 ? parsed : createWelcomeMessages();
  } catch {
    return createWelcomeMessages();
  }
}

export function saveAgentHistory(messages: AgentChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  const filtered = messages.slice(-MAX_PERSISTED_MESSAGES);

  window.localStorage.setItem(AI_AGENT_STORAGE_KEY, JSON.stringify(filtered));
}

export function buildAgentRuntimeSnapshot(input: AgentRuntimeSnapshot) {
  return {
    apps: input.apps.map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description,
    })),
    processes: input.processes.map((process) => ({
      id: process.id,
      appId: process.appId,
      name: process.name,
    })),
    windows: input.windows.map((window) => ({
      id: window.id,
      appId: window.appId,
      title: window.title,
      isMinimized: window.isMinimized,
    })),
    activeWindowId: input.activeWindowId,
    bootPhase: input.bootPhase,
    bootProgress: input.bootProgress,
  };
}

export function buildPostActionSystemMessage(parsed: ParsedCommand) {
  if (parsed.action?.type === "OPEN_APP") {
    return createSystemMessage(`Opened ${parsed.action.payload.label}.`);
  }

  if (parsed.action?.type === "OPEN_TOUR") {
    return createSystemMessage("Started the portfolio tour.");
  }

  if (parsed.action?.type === "OPEN_CONTACT_FLOW") {
    return createSystemMessage("Opened the hiring and contact flow.");
  }

  if (parsed.action?.type === "OPEN_NOTES_DRAFT") {
    return createSystemMessage("Created a fresh draft in Notes.");
  }

  if (parsed.missingTarget) {
    return createSystemMessage(`No installed app matches "${parsed.missingTarget}" yet.`);
  }

  return null;
}

export function buildAgentRequestSummary(requestTitle?: string, sourceLabel?: string) {
  if (requestTitle && sourceLabel) {
    return `${requestTitle} from ${sourceLabel}`;
  }

  if (requestTitle) {
    return requestTitle;
  }

  if (sourceLabel) {
    return `Request from ${sourceLabel}`;
  }

  return "External request";
}
