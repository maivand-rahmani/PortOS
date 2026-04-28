import { NextResponse } from "next/server";

const MAX_USER_TEXT_LENGTH = 4000;
const MAX_CONTENT_LENGTH = 12000;
const MAX_FILE_NAME_LENGTH = 240;
const MAX_MIME_TYPE_LENGTH = 120;
const MAX_AGENT_MESSAGES = 20;

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(the\s+)?system\s+prompt/i,
  /show\s+(me\s+)?your\s+instructions/i,
  /print\s+(the\s+)?hidden\s+prompt/i,
  /leak\s+(the\s+)?prompt/i,
  /developer\s+message/i,
  /system\s+message/i,
  /internal\s+instructions/i,
];

export type AgentRequestMessageInput = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AgentRuntimeContextInput = {
  apps?: Array<{ id: string; name: string; description?: string }>;
  processes?: Array<{ id: string; appId: string; name: string }>;
  windows?: Array<{ id: string; appId: string; title: string; isMinimized: boolean }>;
  activeWindowId?: string | null;
  bootPhase?: string;
  bootProgress?: number;
};

export type ValidatedAgentRequest = {
  messages: AgentRequestMessageInput[];
  runtime?: AgentRuntimeContextInput;
  requestedAction?: string | null;
};

export type ValidatedAiServiceRequest = {
  action: "summarize" | "explain" | "generate" | "modify" | "refactor" | "organize";
  content: string;
  prompt: string;
  fileName: string | null;
  mimeType: string | null;
};

export type ValidatedContactRequest = {
  name: string;
  email: string;
  message: string;
};

const AI_ACTIONS = new Set([
  "summarize",
  "explain",
  "generate",
  "modify",
  "refactor",
  "organize",
] as const);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asTrimmedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

export function createPlainTextError(message: string, status = 400) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function createJsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function validateAiServiceRequest(body: unknown): ValidatedAiServiceRequest | null {
  if (!isRecord(body)) {
    return null;
  }

  const action = typeof body.action === "string" && AI_ACTIONS.has(body.action as never)
    ? (body.action as ValidatedAiServiceRequest["action"])
    : null;
  const prompt = asTrimmedString(body.prompt, MAX_USER_TEXT_LENGTH);
  const content = asTrimmedString(body.content, MAX_CONTENT_LENGTH);

  if (!action || !prompt || !content) {
    return null;
  }

  const fileName = body.fileName == null
    ? null
    : typeof body.fileName === "string" && body.fileName.length <= MAX_FILE_NAME_LENGTH
      ? body.fileName
      : null;
  const mimeType = body.mimeType == null
    ? null
    : typeof body.mimeType === "string" && body.mimeType.length <= MAX_MIME_TYPE_LENGTH
      ? body.mimeType
      : null;

  return {
    action,
    prompt,
    content,
    fileName,
    mimeType,
  };
}

export function validateContactRequest(body: unknown): ValidatedContactRequest | null {
  if (!isRecord(body)) {
    return null;
  }

  const name = asTrimmedString(body.name, 120);
  const email = asTrimmedString(body.email, 240);
  const message = asTrimmedString(body.message, 4000);

  if (!name || !email || !message) {
    return null;
  }

  return { name, email, message };
}

export function validateAgentRequest(body: unknown): ValidatedAgentRequest | null {
  if (!isRecord(body)) {
    return null;
  }

  const messagesInput = Array.isArray(body.messages) ? body.messages : null;

  if (!messagesInput) {
    return null;
  }

  const messages = messagesInput
    .slice(-MAX_AGENT_MESSAGES)
    .map((message) => {
      if (!isRecord(message)) {
        return null;
      }

      const id = asTrimmedString(message.id, 200);
      const role = message.role === "user" || message.role === "assistant" ? message.role : null;
      const content = asTrimmedString(message.content, MAX_USER_TEXT_LENGTH);

      if (!id || !role || !content) {
        return null;
      }

      return { id, role, content };
    })
    .filter((message): message is AgentRequestMessageInput => message !== null);

  if (messages.length === 0) {
    return null;
  }

  const runtime = isRecord(body.runtime) ? {
    apps: Array.isArray(body.runtime.apps)
      ? body.runtime.apps
          .filter(isRecord)
          .map((app) => ({
            id: typeof app.id === "string" ? app.id.slice(0, 80) : "",
            name: typeof app.name === "string" ? app.name.slice(0, 120) : "",
            description: typeof app.description === "string" ? app.description.slice(0, 240) : undefined,
          }))
          .filter((app) => app.id && app.name)
      : undefined,
    processes: Array.isArray(body.runtime.processes)
      ? body.runtime.processes
          .filter(isRecord)
          .map((process) => ({
            id: typeof process.id === "string" ? process.id.slice(0, 80) : "",
            appId: typeof process.appId === "string" ? process.appId.slice(0, 80) : "",
            name: typeof process.name === "string" ? process.name.slice(0, 120) : "",
          }))
          .filter((process) => process.id && process.appId && process.name)
      : undefined,
    windows: Array.isArray(body.runtime.windows)
      ? body.runtime.windows
          .filter(isRecord)
          .map((window) => ({
            id: typeof window.id === "string" ? window.id.slice(0, 80) : "",
            appId: typeof window.appId === "string" ? window.appId.slice(0, 80) : "",
            title: typeof window.title === "string" ? window.title.slice(0, 160) : "",
            isMinimized: Boolean(window.isMinimized),
          }))
          .filter((window) => window.id && window.appId && window.title)
      : undefined,
    activeWindowId:
      typeof body.runtime.activeWindowId === "string" || body.runtime.activeWindowId === null
        ? body.runtime.activeWindowId
        : undefined,
    bootPhase: typeof body.runtime.bootPhase === "string" ? body.runtime.bootPhase.slice(0, 40) : undefined,
    bootProgress: typeof body.runtime.bootProgress === "number" ? body.runtime.bootProgress : undefined,
  } : undefined;

  return {
    messages,
    runtime,
    requestedAction:
      typeof body.requestedAction === "string"
        ? body.requestedAction.slice(0, 120)
        : body.requestedAction === null
          ? null
          : undefined,
  };
}

export function sanitizeUntrustedText(value: string, maxLength: number): string {
  return value.replace(/\u0000/g, "").slice(0, maxLength).trim();
}

export function detectPromptInjection(value: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

export function buildInjectionSafePrompt(label: string, value: string) {
  return `${label}:\n<untrusted-input>\n${value}\n</untrusted-input>`;
}
