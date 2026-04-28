import type { AiServiceContext } from "@/processes";

export function buildBlogAiContext(input: {
  windowId: string;
  activePostTitle: string | null;
  activePostId: string | null;
  postCount: number;
  query: string;
  queuedCount: number;
  completedCount: number;
  highlightCount: number;
}): AiServiceContext {
  return {
    sourceAppId: "blog",
    sourceWindowId: input.windowId,
    appState: {
      activePostTitle: input.activePostTitle,
      activePostId: input.activePostId,
      postCount: input.postCount,
      query: input.query,
      queuedCount: input.queuedCount,
      completedCount: input.completedCount,
      highlightCount: input.highlightCount,
    },
  };
}