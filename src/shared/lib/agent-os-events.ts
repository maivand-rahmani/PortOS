export const AGENT_NOTES_PREFILL_EVENT = "portos:agent-notes-prefill";
const AGENT_NOTES_PREFILL_STORAGE_KEY = "portos-agent-notes-prefill";

export type AgentNotesPrefillDetail = {
  title: string;
  body: string;
  tags?: string[];
  pinned?: boolean;
};

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
