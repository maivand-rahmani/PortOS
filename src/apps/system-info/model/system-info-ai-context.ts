import type { AiServiceContext } from "@/processes";

export function buildSystemInfoAiContext(input: {
  windowId: string;
  processCount: number;
  windowCount: number;
  appCount: number;
  selectedProcessId: string;
  selectedProcessName: string | null;
  selectedDiagnosticId: string;
  bootProgress: number;
}): AiServiceContext {
  return {
    sourceAppId: "system-info",
    sourceWindowId: input.windowId,
    appState: {
      processCount: input.processCount,
      windowCount: input.windowCount,
      appCount: input.appCount,
      selectedProcessId: input.selectedProcessId,
      selectedProcessName: input.selectedProcessName,
      selectedDiagnosticId: input.selectedDiagnosticId,
      bootProgress: input.bootProgress,
    },
  };
}