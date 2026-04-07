/**
 * Context injection helpers for the AI service.
 *
 * Pure functions that build context objects from the OS runtime state
 * and prepare content for the AI API.
 */

import type { AiServiceContext, AiServiceRequest, AiActionId } from "./ai-service.types";

/** Maximum content length sent to the AI service (chars). */
const MAX_CONTENT_LENGTH = 6000;

/** Truncate content to fit within the token budget. */
export function truncateContent(content: string, maxLength = MAX_CONTENT_LENGTH): string {
  if (content.length <= maxLength) {
    return content;
  }

  return content.slice(0, maxLength) + "\n\n[...content truncated]";
}

function normalizeAppStateValue(value: unknown): unknown {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    return normalized ? normalized : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => normalizeAppStateValue(entry))
      .filter((entry) => entry != null);

    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === "object") {
    const normalizedEntries = Object.entries(value)
      .map(([key, entry]) => [key, normalizeAppStateValue(entry)] as const)
      .filter(([, entry]) => entry != null);

    return normalizedEntries.length > 0 ? Object.fromEntries(normalizedEntries) : null;
  }

  return null;
}

export function buildAppStatePayload(context: AiServiceContext): string {
  const normalized = normalizeAppStateValue(context.appState);

  if (!normalized || typeof normalized !== "object") {
    return "";
  }

  return JSON.stringify(normalized, null, 2);
}

/** Build the content payload for the API request. */
export function buildContentPayload(context: AiServiceContext): string {
  const selection = context.selection?.text;
  const fileContent = context.file?.content;
  const appStatePayload = buildAppStatePayload(context);

  if (selection) {
    return truncateContent(
      appStatePayload
        ? `${selection}\n\nApp context:\n${appStatePayload}`
        : selection,
    );
  }

  if (fileContent) {
    return truncateContent(
      appStatePayload
        ? `${fileContent}\n\nApp context:\n${appStatePayload}`
        : fileContent,
    );
  }

  if (appStatePayload) {
    return truncateContent(`App context:\n${appStatePayload}`);
  }

  return "";
}

/** Build a unique request ID. */
function generateRequestId(): string {
  return `ai-req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Build a session ID for transcript grouping. */
export function generateSessionId(): string {
  return `ai-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Create an AiServiceRequest from the current palette state. */
export function buildAiServiceRequest(
  action: AiActionId,
  context: AiServiceContext,
  userPrompt?: string,
): AiServiceRequest {
  return {
    id: generateRequestId(),
    action,
    context,
    userPrompt,
    createdAt: new Date().toISOString(),
  };
}

/** Build a human-readable summary of the context for display. */
export function describeContext(context: AiServiceContext): string {
  if (context.selection?.text) {
    const lineCount = context.selection.text.split("\n").length;
    const from = context.file?.name ?? "unknown file";

    return `${lineCount} line${lineCount !== 1 ? "s" : ""} selected in ${from}`;
  }

  if (context.file) {
    return context.file.name;
  }

  return "No file context";
}
