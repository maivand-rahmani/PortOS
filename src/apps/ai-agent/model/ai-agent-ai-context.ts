import type { AiServiceContext } from "@/processes";

export function buildAiAgentAiContext(input: {
  windowId: string;
  messageCount: number;
  isStreaming: boolean;
  hasUserMessages: boolean;
  activeRequestSource: string | null;
}): AiServiceContext {
  return {
    sourceAppId: "ai-agent",
    sourceWindowId: input.windowId,
    appState: {
      messageCount: input.messageCount,
      isStreaming: input.isStreaming,
      hasUserMessages: input.hasUserMessages,
      activeRequestSource: input.activeRequestSource,
    },
  };
}