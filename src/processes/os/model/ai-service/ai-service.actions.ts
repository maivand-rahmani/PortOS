/**
 * AI action registry — defines all built-in AI actions and their metadata.
 *
 * Each action describes what it does, which apps can use it, and how
 * the result should be applied (replace current content, create a new
 * file, or display inline).
 */

import { buildAppStatePayload } from "./ai-service.context";
import type { AiActionDefinition, AiActionId, AiServiceContext, AiServiceResult } from "./ai-service.types";

export const AI_ACTIONS: readonly AiActionDefinition[] = [
  {
    id: "summarize",
    label: "Summarize",
    description: "Create a concise summary of the content",
    availableIn: ["*"],
    outputMode: "inline",
    shortcutHint: "1",
  },
  {
    id: "explain",
    label: "Explain",
    description: "Explain what this content does or means",
    availableIn: ["*"],
    outputMode: "inline",
    shortcutHint: "2",
  },
  {
    id: "generate",
    label: "Generate",
    description: "Generate new content based on context",
    availableIn: ["*"],
    outputMode: "new-file",
    shortcutHint: "3",
  },
  {
    id: "modify",
    label: "Modify",
    description: "Rewrite or improve the content",
    availableIn: ["editor", "notes", "*"],
    outputMode: "replace",
    shortcutHint: "4",
  },
  {
    id: "refactor",
    label: "Refactor",
    description: "Restructure code while keeping behavior",
    availableIn: ["editor", "terminal"],
    outputMode: "replace",
    shortcutHint: "5",
  },
  {
    id: "organize",
    label: "Organize",
    description: "Reorganize and structure the content",
    availableIn: ["notes", "files", "editor"],
    outputMode: "replace",
    shortcutHint: "6",
  },
] as const;

/** Look up an action definition by ID. */
export function getAiAction(actionId: AiActionId): AiActionDefinition | undefined {
  return AI_ACTIONS.find((a) => a.id === actionId);
}

/** Return actions available for a given app context. */
export function getAvailableActions(context: AiServiceContext): AiActionDefinition[] {
  return AI_ACTIONS.filter(
    (action) =>
      action.availableIn.includes("*") ||
      action.availableIn.includes(context.sourceAppId),
  );
}

function resolveActionDefinition(action: AiActionDefinition | AiActionId): AiActionDefinition | undefined {
  return typeof action === "string" ? getAiAction(action) : action;
}

export function hasAiSelection(context: AiServiceContext): boolean {
  return Boolean(context.selection?.text.trim());
}

export function hasAiFileContent(context: AiServiceContext): boolean {
  return Boolean(context.file?.content.trim());
}

export function hasAiReplaceTarget(context: AiServiceContext): boolean {
  return Boolean(context.file);
}

export function hasAiAppStatePayload(context: AiServiceContext): boolean {
  return Boolean(buildAppStatePayload(context).trim());
}

export function canExecuteAiAction(
  action: AiActionDefinition | AiActionId,
  context: AiServiceContext,
): boolean {
  const definition = resolveActionDefinition(action);

  if (!definition) {
    return false;
  }

  const hasSelection = hasAiSelection(context);
  const hasFileContent = hasAiFileContent(context);
  const hasAppState = hasAiAppStatePayload(context);

  switch (definition.id) {
    case "generate":
      return true;
    case "summarize":
    case "explain":
      return hasSelection || hasFileContent || hasAppState;
    case "modify":
      return hasSelection || hasFileContent;
    case "refactor":
      return context.sourceAppId === "terminal"
        ? hasSelection
        : hasSelection || hasFileContent;
    case "organize":
      return hasSelection || hasFileContent;
  }
}

export function getAiActionDisabledReason(
  action: AiActionDefinition | AiActionId,
  context: AiServiceContext,
): string | null {
  const definition = resolveActionDefinition(action);

  if (!definition || canExecuteAiAction(definition, context)) {
    return null;
  }

  switch (definition.id) {
    case "summarize":
    case "explain":
      return "Needs selected text, file content, or published app context.";
    case "modify":
      return context.sourceAppId === "notes"
        ? "Open a note or select note text to rewrite."
        : "Open content or select text to rewrite.";
    case "refactor":
      return context.sourceAppId === "terminal"
        ? "Type or select a command to refactor."
        : "Open code or select text to refactor.";
    case "organize":
      return context.sourceAppId === "files"
        ? "Preview or select a text file to organize."
        : "Open content or select text to organize.";
    default:
      return null;
  }
}

export function canApplyAiResult(result: AiServiceResult, context: AiServiceContext): boolean {
  if (result.outputMode === "inline") {
    return false;
  }

  if (result.outputMode === "new-file") {
    return true;
  }

  if (context.sourceAppId === "terminal") {
    return false;
  }

  return hasAiReplaceTarget(context);
}

/** Build the default user prompt for an action when none is provided. */
export function buildDefaultPrompt(
  actionId: AiActionId,
  context: AiServiceContext,
): string {
  const fileName = context.file?.name ?? `${context.sourceAppId} context`;
  const selection = context.selection?.text;

  switch (actionId) {
    case "summarize":
      return selection
        ? `Summarize the following selected text from ${fileName}.`
        : `Summarize the contents of ${fileName}.`;
    case "explain":
      return selection
        ? `Explain the following selected text from ${fileName}.`
        : `Explain what ${fileName} does.`;
    case "generate":
      return `Generate new content based on the context of ${fileName}.`;
    case "modify":
      return selection
        ? `Improve the following selected text from ${fileName}.`
        : `Improve the contents of ${fileName}.`;
    case "refactor":
      return selection
        ? `Refactor the following selected code from ${fileName}.`
        : `Refactor the code in ${fileName}.`;
    case "organize":
      return selection
        ? `Reorganize the following selected content from ${fileName}.`
        : `Reorganize the contents of ${fileName} for clarity.`;
  }
}
