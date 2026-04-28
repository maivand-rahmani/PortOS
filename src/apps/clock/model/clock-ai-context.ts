import type { AiServiceContext } from "@/processes";

export function buildClockAiContext(input: {
  windowId: string;
  trackedCityCount: number;
  spotlightCity: string | null;
  use24Hour: boolean;
  favoriteCount: number;
  searchQuery: string;
}): AiServiceContext {
  return {
    sourceAppId: "clock",
    sourceWindowId: input.windowId,
    appState: {
      trackedCityCount: input.trackedCityCount,
      spotlightCity: input.spotlightCity,
      use24Hour: input.use24Hour,
      favoriteCount: input.favoriteCount,
      searchQuery: input.searchQuery,
    },
  };
}