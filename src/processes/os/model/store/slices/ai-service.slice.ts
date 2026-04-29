import type { StateCreator } from "zustand";
import type { OSStore } from "../store.types";
import type {
  AiActionId,
  AiServiceContext,
  AiServiceResult,
  AiTranscriptFile,
} from "../../ai-service";
import {
  aiServiceManagerInitialState,
  buildAiServiceRequest,
  buildContentPayload,
  buildDefaultPrompt,
  canApplyAiResult,
  generateSessionId,
  buildTranscriptEntry,
  buildTranscriptFileName,
  buildTranscriptPath,
  createTranscriptFile,
  appendToTranscript,
  serializeTranscript,
  getAiAction,
} from "../../ai-service";
import { ensureDirectoryAtPath, writeFileAtPathOrCreate } from "@/shared/lib/fs/fs-actions";
import { dispatchNotesExternalRequest } from "@/shared/lib/os-events/notes-os-events";
import type { AbsolutePath } from "@/entities/file-system";

export type AiServiceSlice = Pick<
  OSStore,
  | "aiStatus"
  | "aiCurrentRequest"
  | "aiStreamContent"
  | "aiLastResult"
  | "aiError"
  | "aiSessionId"
  | "aiPaletteOpen"
  | "aiPaletteContext"
  | "aiWindowContexts"
  | "aiMessages"
  | "aiCurrentTranscript"
> & {
  aiOpenPalette: (context: AiServiceContext) => void;
  aiClosePalette: () => void;
  aiExecuteAction: (actionId: AiActionId, userPrompt?: string) => Promise<void>;
  aiApplyResult: (mode?: "replace" | "new-file") => Promise<void>;
  aiCancelRequest: () => void;
  aiClearResult: () => void;
  aiPublishWindowContext: (windowId: string, context: AiServiceContext) => void;
  aiClearWindowContext: (windowId: string) => void;
  aiStartNewSession: () => void;
};

export const createAiServiceSlice: StateCreator<OSStore, [], [], AiServiceSlice> = (set, get) => ({
  ...aiServiceManagerInitialState,
  abortController: null as AbortController | null,
  aiCurrentTranscript: null,

  aiStartNewSession: () => {
    if (get().abortController) {
      get().abortController!.abort();
      set({ abortController: null });
    }
    set({
      aiSessionId: null,
      aiMessages: [],
      aiStatus: "idle",
      aiCurrentRequest: null,
      aiStreamContent: "",
      aiLastResult: null,
      aiError: null,
      aiCurrentTranscript: null,
    });
  },

  aiOpenPalette: (context: AiServiceContext) => {
    const sessionId = get().aiSessionId ?? generateSessionId();

    if (!get().aiCurrentTranscript) {
      set({ aiCurrentTranscript: createTranscriptFile(sessionId) });
    }

    set({
      aiPaletteOpen: true,
      aiPaletteContext: context,
      aiSessionId: sessionId,
      aiStatus: "idle",
      aiStreamContent: "",
      aiLastResult: null,
      aiError: null,
    });
  },

  aiPublishWindowContext: (windowId, context) => {
    set((state) => ({
      aiWindowContexts: {
        ...state.aiWindowContexts,
        [windowId]: context,
      },
    }));
  },

  aiClearWindowContext: (windowId) => {
    set((state) => {
      if (!state.aiWindowContexts[windowId]) {
        return state;
      }

      const nextContexts = { ...state.aiWindowContexts };

      delete nextContexts[windowId];

      return {
        aiWindowContexts: nextContexts,
      };
    });
  },

  aiClosePalette: () => {
    if (get().abortController) {
      get().abortController!.abort();
      set({ abortController: null });
    }

    set({
      aiPaletteOpen: false,
      aiPaletteContext: null,
      aiStatus: "idle",
      aiCurrentRequest: null,
      aiStreamContent: "",
      aiLastResult: null,
      aiError: null,
    });
  },

  aiExecuteAction: async (actionId: AiActionId, userPrompt?: string) => {
    const state = get();
    const context = state.aiPaletteContext;

    if (!context) return;

    const actionDef = getAiAction(actionId);
    if (!actionDef) return;

    const request = buildAiServiceRequest(actionId, context, userPrompt);

    // Cancel any in-flight request
    if (get().abortController) {
      get().abortController!.abort();
    }

    set({ abortController: new AbortController() });
    const signal = get().abortController!.signal;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: userPrompt ? `${actionDef.label}: ${userPrompt}` : actionDef.label,
      createdAt: Date.now(),
      actionId,
    };

    set((state) => ({
      aiStatus: "loading",
      aiCurrentRequest: request,
      aiStreamContent: "",
      aiLastResult: null,
      aiError: null,
      aiMessages: [...state.aiMessages, userMessage],
    }));

    try {
      const contentPayload = buildContentPayload(context);
      const prompt = userPrompt || buildDefaultPrompt(actionId, context);

      const response = await fetch("/api/ai-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionId,
          content: contentPayload,
          prompt,
          fileName: context.file?.name ?? null,
          mimeType: context.file?.mimeType ?? null,
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `AI service error (${response.status})`);
      }

      if (!response.body) {
        throw new Error("No response body from AI service");
      }

      set({ aiStatus: "streaming" });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        set({ aiStreamContent: accumulated });
      }

      // Flush decoder
      accumulated += decoder.decode();

      const result: AiServiceResult = {
        requestId: request.id,
        content: accumulated,
        outputMode: actionDef.outputMode,
        suggestedPath: actionDef.outputMode === "new-file" && context.file
          ? context.file.path.replace(/(\.[^.]+)$/, `-${actionId}$1`)
          : undefined,
        completedAt: new Date().toISOString(),
      };

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: accumulated,
        createdAt: Date.now(),
        actionId,
      };

      set((state) => ({
        aiStatus: "done",
        aiStreamContent: accumulated,
        aiLastResult: result,
        aiMessages: [...state.aiMessages, assistantMessage],
      }));

      // Persist transcript entry
      const sessionId = get().aiSessionId;
      const transcript = get().aiCurrentTranscript;
      if (sessionId && transcript) {
        const entry = buildTranscriptEntry(sessionId, request, result);
        const updated = appendToTranscript(transcript, entry);
        set({ aiCurrentTranscript: updated });
        void persistTranscript(updated);
      }
    } catch (error) {
      if (signal.aborted) return;

      const message = error instanceof Error ? error.message : "AI service failed";

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "error" as const,
        content: message,
        createdAt: Date.now(),
      };

      set((state) => ({
        aiStatus: "error",
        aiError: message,
        aiMessages: [...state.aiMessages, errorMessage],
      }));

      // Persist error in transcript
      const sessionId = get().aiSessionId;
      const transcript = get().aiCurrentTranscript;
      if (sessionId && transcript) {
        const entry = buildTranscriptEntry(sessionId, request, null, message);
        const updated = appendToTranscript(transcript, entry);
        set({ aiCurrentTranscript: updated });
        void persistTranscript(updated);
      }
    } finally {
      set({ abortController: null });
    }
  },

  aiApplyResult: async (mode?: "replace" | "new-file") => {
    const state = get();
    const result = state.aiLastResult;
    const context = state.aiPaletteContext;

    if (!result || !context) return;

    if (!canApplyAiResult(result, context)) {
      get().pushNotification({
        title: "AI: Apply unavailable",
        body: "This result cannot be applied to the current context.",
        level: "error",
        appId: context.sourceAppId,
      });
      return;
    }

    const outputMode = mode ?? result.outputMode;

    try {
      if (outputMode === "replace" && context.file) {
        if (context.sourceAppId === "notes") {
          dispatchNotesExternalRequest({
            mode: "replace" as const,
            id: String(context.appState?.noteId ?? ""),
            title: String(context.appState?.noteTitle ?? context.file.name),
            body: result.content,
            tags: Array.isArray(context.appState?.tags)
              ? context.appState.tags.map((tag) => String(tag))
              : undefined,
            pinned: Boolean(context.appState?.isPinned),
            selectAfterWrite: true,
            source: "System AI",
            targetWindowId: context.sourceWindowId,
          });
        } else {
          await get().fsWriteContent(context.file.nodeId, result.content);
        }

        get().pushNotification({
          title: "AI: Content updated",
          body: `Updated ${context.file.name}`,
          level: "success",
          appId: context.sourceAppId,
        });
      } else if (outputMode === "new-file") {
        const suggestedPath = result.suggestedPath ?? "/Documents/ai-output.txt";

        await writeFileAtPathOrCreate(suggestedPath as AbsolutePath, result.content);

        get().pushNotification({
          title: "AI: File created",
          body: `Created ${suggestedPath.split("/").pop()}`,
          level: "success",
          appId: context.sourceAppId,
        });
      }
    } catch {
      get().pushNotification({
        title: "AI: Failed to apply",
        body: "Could not write the result to the file system.",
        level: "error",
        appId: context.sourceAppId,
      });
    }

    // Close the palette after applying
    set({
      aiPaletteOpen: false,
      aiPaletteContext: null,
      aiStatus: "idle",
      aiCurrentRequest: null,
      aiStreamContent: "",
      aiLastResult: null,
      aiError: null,
    });
  },

  aiCancelRequest: () => {
    if (get().abortController) {
      get().abortController!.abort();
      set({ abortController: null });
    }

    set({
      aiStatus: "idle",
      aiCurrentRequest: null,
      aiStreamContent: "",
      aiError: null,
    });
  },

  aiClearResult: () => {
    set({
      aiStatus: "idle",
      aiCurrentRequest: null,
      aiStreamContent: "",
      aiLastResult: null,
      aiError: null,
    });
  },
});

/** Persist the current transcript to the virtual filesystem. */
async function persistTranscript(transcript: AiTranscriptFile): Promise<void> {
  try {
    await ensureDirectoryAtPath("/System/user/ai/transcripts" as AbsolutePath);
    const fileName = buildTranscriptFileName(transcript.sessionId);
    const path = buildTranscriptPath(fileName) as AbsolutePath;

    await writeFileAtPathOrCreate(path, serializeTranscript(transcript));
  } catch {
    // Transcript persistence is best-effort — don't crash the AI service
  }
}
