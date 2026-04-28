import type { AiServiceContext } from "@/processes";

export function buildResumeAiContext(input: {
  windowId: string;
  activeSection: string;
  selectedProjectId: string;
  selectedProjectTitle: string | null;
  activeLensId: string;
  activeLensLabel: string | null;
}): AiServiceContext {
  return {
    sourceAppId: "resume",
    sourceWindowId: input.windowId,
    appState: {
      activeSection: input.activeSection,
      selectedProjectId: input.selectedProjectId,
      selectedProjectTitle: input.selectedProjectTitle,
      activeLensId: input.activeLensId,
      activeLensLabel: input.activeLensLabel,
    },
  };
}