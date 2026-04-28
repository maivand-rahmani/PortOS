import type { AiServiceContext } from "@/processes";

export function buildDocsAiContext(input: {
  windowId: string;
  activeDocumentTitle: string | null;
  activeDocumentPath: string | null;
  documentCount: number;
}): AiServiceContext {
  return {
    sourceAppId: "docs",
    sourceWindowId: input.windowId,
    appState: {
      activeDocumentTitle: input.activeDocumentTitle,
      activeDocumentPath: input.activeDocumentPath,
      documentCount: input.documentCount,
    },
  };
}