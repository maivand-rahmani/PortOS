export type {
  AiActionDefinition,
  AiActionId,
  AiMessage,
  AiMessageRole,
  AiServiceContext,
  AiServiceManagerState,
  AiServiceRequest,
  AiServiceResult,
  AiServiceStatus,
  AiTranscriptEntry,
  AiTranscriptFile,
} from "./ai-service.types";
export {
  AI_ACTIONS,
  buildDefaultPrompt,
  canApplyAiResult,
  canExecuteAiAction,
  getAiAction,
  getAiActionDisabledReason,
  getAvailableActions,
  hasAiAppStatePayload,
  hasAiFileContent,
  hasAiReplaceTarget,
  hasAiSelection,
} from "./ai-service.actions";
export {
  buildAppStatePayload,
  buildAiServiceRequest,
  buildContentPayload,
  describeContext,
  generateSessionId,
  truncateContent,
} from "./ai-service.context";
export {
  appendToTranscript,
  buildTranscriptEntry,
  buildTranscriptFileName,
  buildTranscriptPath,
  createTranscriptFile,
  MAX_TRANSCRIPT_FILES,
  serializeTranscript,
} from "./ai-service.transcripts";

/** Initial state factory for the AI service manager. */
export const aiServiceManagerInitialState = {
  aiStatus: "idle" as const,
  aiCurrentRequest: null,
  aiCurrentTranscript: null,
  aiStreamContent: "",
  aiLastResult: null,
  aiError: null,
  aiSessionId: null,
  aiPaletteOpen: false,
  aiPaletteContext: null,
  aiWindowContexts: {},
  aiMessages: [],
};
