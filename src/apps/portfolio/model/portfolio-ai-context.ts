import type { AiServiceContext } from "@/processes";

export function buildPortfolioAiContext(input: {
  windowId: string;
  activeFilter: string;
  selectedProjectId: string;
  selectedProjectTitle: string | null;
  visibleProjectCount: number;
  activeHandoffId: string;
}): AiServiceContext {
  return {
    sourceAppId: "portfolio",
    sourceWindowId: input.windowId,
    appState: {
      activeFilter: input.activeFilter,
      selectedProjectId: input.selectedProjectId,
      selectedProjectTitle: input.selectedProjectTitle,
      visibleProjectCount: input.visibleProjectCount,
      activeHandoffId: input.activeHandoffId,
    },
  };
}