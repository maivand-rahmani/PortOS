/**
 * Type definitions for the OS-level AI service.
 *
 * The AI service is a system-level capability that provides context-aware
 * AI actions (summarize, generate, modify, etc.) accessible from any app
 * via the command palette (Space+K).
 */

// ── Action Definitions ──────────────────────────────────

/** Identifiers for built-in AI actions. */
export type AiActionId =
  | "summarize"
  | "generate"
  | "modify"
  | "explain"
  | "refactor"
  | "organize";

/** Describes what an AI action does and where it's available. */
export type AiActionDefinition = {
  id: AiActionId;
  label: string;
  description: string;
  /** Which apps can use this action. `"*"` means all apps. */
  availableIn: readonly string[];
  /** How the result should be applied. */
  outputMode: "replace" | "new-file" | "inline";
  /** Keyboard hint shown in the palette. */
  shortcutHint?: string;
};

// ── Context ─────────────────────────────────────────────

/** Context injected by the requesting app into the AI service. */
export type AiServiceContext = {
  /** Which app is requesting. */
  sourceAppId: string;
  /** The window ID the request originated from. */
  sourceWindowId: string;
  /** Current file being viewed or edited (if any). */
  file?: {
    nodeId: string;
    path: string;
    name: string;
    mimeType: string;
    content: string;
  };
  /** Text selection within the file (if any). */
  selection?: {
    text: string;
    startLine?: number;
    endLine?: number;
  };
  /** Free-form app-specific state the app wants to share. */
  appState?: Record<string, unknown>;
};

// ── Request / Result ────────────────────────────────────

/** A request sent to the AI service. */
export type AiServiceRequest = {
  id: string;
  action: AiActionId;
  context: AiServiceContext;
  /** Additional user instruction typed in the palette. */
  userPrompt?: string;
  createdAt: string;
};

/** Processing status of the AI service. */
export type AiServiceStatus =
  | "idle"
  | "loading"
  | "streaming"
  | "done"
  | "error";

/** The result of an AI action. */
export type AiServiceResult = {
  requestId: string;
  content: string;
  outputMode: "replace" | "new-file" | "inline";
  /** Suggested file path when outputMode is "new-file". */
  suggestedPath?: string;
  completedAt: string;
};

// ── Transcript ──────────────────────────────────────────

/** A single transcript entry for persistence. */
export type AiTranscriptEntry = {
  id: string;
  sessionId: string;
  request: AiServiceRequest;
  result: AiServiceResult | null;
  error?: string;
  createdAt: string;
};

/** Serialized transcript file. */
export type AiTranscriptFile = {
  sessionId: string;
  startedAt: string;
  entries: AiTranscriptEntry[];
};

// ── Chat History ────────────────────────────────────────

/** Roles for messages in the AI palette chat history. */
export type AiMessageRole = "user" | "assistant" | "system" | "error";

/** A single message in the AI palette visual history. */
export type AiMessage = {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: number;
  /** Optional action ID if this message was triggered by a specific action */
  actionId?: string;
};

// ── Zustand Slice State ─────────────────────────────────

/** State shape for the AI service Zustand slice. */
export type AiServiceManagerState = {
  aiStatus: AiServiceStatus;
  aiCurrentRequest: AiServiceRequest | null;
  aiStreamContent: string;
  aiLastResult: AiServiceResult | null;
  aiError: string | null;
  aiSessionId: string | null;
  aiPaletteOpen: boolean;
  aiPaletteContext: AiServiceContext | null;
  aiWindowContexts: Record<string, AiServiceContext>;
  aiMessages: AiMessage[];
};
