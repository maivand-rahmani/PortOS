export const AGENT_NOTES_PREFILL_EVENT = "portos:agent-notes-prefill";
const AGENT_NOTES_PREFILL_STORAGE_KEY = "portos-agent-notes-prefill";
export const AI_AGENT_EXTERNAL_PROMPT_EVENT = "portos:ai-agent-external-prompt";
export const AI_AGENT_EXTERNAL_REQUEST_EVENT = "portos:ai-agent-external-request";
const AI_AGENT_PENDING_PROMPT_KEY = "portos-ai-agent-pending-prompt";
const AI_AGENT_PENDING_REQUEST_KEY = "portos-ai-agent-pending-request";

export type AgentNotesPrefillDetail = {
  title: string;
  body: string;
  tags?: string[];
  pinned?: boolean;
};

export type AgentExternalRequest = {
  prompt: string;
  mode?: "send" | "prefill";
  title?: string;
  source?: {
    appId?: string;
    label: string;
  };
  suggestions?: string[];
};

function isAgentExternalRequest(value: unknown): value is AgentExternalRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  return typeof (value as AgentExternalRequest).prompt === "string";
}

export function normalizeAgentExternalRequest(input: AgentExternalRequest | string): AgentExternalRequest {
  if (typeof input === "string") {
    return {
      prompt: input,
      mode: "send",
    };
  }

  return {
    prompt: input.prompt,
    mode: input.mode ?? "send",
    title: input.title,
    source: input.source,
    suggestions: input.suggestions?.filter((suggestion) => suggestion.trim().length > 0),
  };
}

export function dispatchAgentNotesPrefill(detail: AgentNotesPrefillDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AGENT_NOTES_PREFILL_STORAGE_KEY, JSON.stringify(detail));

  window.dispatchEvent(
    new CustomEvent<AgentNotesPrefillDetail>(AGENT_NOTES_PREFILL_EVENT, {
      detail,
    }),
  );
}

export function clearPendingAgentRequest() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AI_AGENT_PENDING_REQUEST_KEY);
  window.localStorage.removeItem(AI_AGENT_PENDING_PROMPT_KEY);
}

export function dispatchAgentRequest(input: AgentExternalRequest | string) {
  if (typeof window === "undefined") {
    return;
  }

  const request = normalizeAgentExternalRequest(input);

  if (!request.prompt.trim()) {
    return;
  }

  window.localStorage.setItem(AI_AGENT_PENDING_REQUEST_KEY, JSON.stringify(request));

  window.dispatchEvent(
    new CustomEvent<AgentExternalRequest>(AI_AGENT_EXTERNAL_REQUEST_EVENT, {
      detail: request,
    }),
  );
}

export function consumePendingAgentRequest() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedRequest = window.localStorage.getItem(AI_AGENT_PENDING_REQUEST_KEY);

  if (storedRequest) {
    window.localStorage.removeItem(AI_AGENT_PENDING_REQUEST_KEY);

    try {
      const parsed = JSON.parse(storedRequest) as unknown;

      if (isAgentExternalRequest(parsed)) {
        return normalizeAgentExternalRequest(parsed);
      }
    } catch {
      return null;
    }
  }

  const legacyPrompt = window.localStorage.getItem(AI_AGENT_PENDING_PROMPT_KEY);

  if (!legacyPrompt) {
    return null;
  }

  window.localStorage.removeItem(AI_AGENT_PENDING_PROMPT_KEY);

  return normalizeAgentExternalRequest(legacyPrompt);
}

export function consumeAgentNotesPrefill() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(AGENT_NOTES_PREFILL_STORAGE_KEY);

  if (!value) {
    return null;
  }

  window.localStorage.removeItem(AGENT_NOTES_PREFILL_STORAGE_KEY);

  try {
    return JSON.parse(value) as AgentNotesPrefillDetail;
  } catch {
    return null;
  }
}
