export const AGENT_NOTES_PREFILL_EVENT = "portos:agent-notes-prefill";
const AGENT_NOTES_PREFILL_STORAGE_KEY = "portos-agent-notes-prefill";
export const AI_AGENT_EXTERNAL_PROMPT_EVENT = "portos:ai-agent-external-prompt";
export const AI_AGENT_EXTERNAL_REQUEST_EVENT = "portos:ai-agent-external-request";
const AI_AGENT_PENDING_PROMPT_KEY = "portos-ai-agent-pending-prompt";
const AI_AGENT_PENDING_REQUEST_KEY = "portos-ai-agent-pending-request";

import {
  clearWindowRequest,
  consumeUntargetedWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

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

  dispatchWindowRequest(
    AGENT_NOTES_PREFILL_STORAGE_KEY,
    AGENT_NOTES_PREFILL_EVENT,
    detail,
  );
}

export function clearPendingAgentRequest() {
  clearWindowRequest(AI_AGENT_PENDING_REQUEST_KEY);
  clearWindowRequest(AI_AGENT_PENDING_PROMPT_KEY);
}

export function dispatchAgentRequest(input: AgentExternalRequest | string) {
  if (typeof window === "undefined") {
    return;
  }

  const request = normalizeAgentExternalRequest(input);

  if (!request.prompt.trim()) {
    return;
  }

  dispatchWindowRequest(
    AI_AGENT_PENDING_REQUEST_KEY,
    AI_AGENT_EXTERNAL_REQUEST_EVENT,
    request,
  );
}

export function consumePendingAgentRequest() {
  const storedRequest = consumeUntargetedWindowRequest<unknown>(AI_AGENT_PENDING_REQUEST_KEY);

  if (storedRequest && isAgentExternalRequest(storedRequest)) {
    return normalizeAgentExternalRequest(storedRequest);
  }

  const legacyPrompt = consumeUntargetedWindowRequest<string>(AI_AGENT_PENDING_PROMPT_KEY);

  if (!legacyPrompt) {
    return null;
  }

  return normalizeAgentExternalRequest(legacyPrompt);
}

export function consumeAgentNotesPrefill() {
  return consumeUntargetedWindowRequest<AgentNotesPrefillDetail>(
    AGENT_NOTES_PREFILL_STORAGE_KEY,
  );
}
