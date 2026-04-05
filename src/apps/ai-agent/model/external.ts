import {
  consumePendingAgentRequest,
  dispatchAgentRequest,
  type AgentExternalRequest,
} from "@/shared/lib/os-events/agent-os-events";
import { openAppById } from "@/shared/lib/os-actions/os-actions";

export {
  AI_AGENT_EXTERNAL_PROMPT_EVENT,
  AI_AGENT_EXTERNAL_REQUEST_EVENT,
  clearPendingAgentRequest,
  normalizeAgentExternalRequest,
} from "@/shared/lib/os-events/agent-os-events";
export type { AgentExternalRequest } from "@/shared/lib/os-events/agent-os-events";

export async function openAgentWithRequest(input: AgentExternalRequest | string) {
  dispatchAgentRequest(input);

  return openAppById("ai-agent");
}

export async function openAgentWithPrompt(prompt: string) {
  return openAgentWithRequest(prompt);
}

export { consumePendingAgentRequest };
