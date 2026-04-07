import type { AiActionDefinition, AiActionId } from "@/processes";

/**
 * Advances the selected action index with wrap-around.
 * Used by the AI command palette for keyboard-based action navigation.
 */
export function moveSelectedAction(
  actions: AiActionDefinition[],
  currentActionId: AiActionId | null,
  direction: 1 | -1,
  setSelectedActionId: (actionId: AiActionId) => void,
) {
  if (actions.length === 0) {
    return;
  }

  const currentIndex = currentActionId
    ? actions.findIndex((action) => action.id === currentActionId)
    : -1;
  const nextIndex =
    currentIndex === -1 ? 0 : (currentIndex + direction + actions.length) % actions.length;
  const nextAction = actions[nextIndex];

  if (!nextAction) {
    return;
  }

  setSelectedActionId(nextAction.id);
}
