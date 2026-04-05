"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useOSStore } from "@/processes";
import { openAppById, openNotesWithPrefill } from "@/shared/lib";

import { describeRequestedAction, parseAgentCommand } from "./commandParser";
import {
  buildAgentRequestSummary,
  buildAgentRuntimeSnapshot,
  buildPostActionSystemMessage,
  clearAgentHistory,
  createAssistantMessage,
  createSystemMessage,
  createUserMessage,
  readStoredAgentHistory,
  saveAgentHistory,
  type AgentChatMessage,
} from "./contextLoader";
import {
  AI_AGENT_EXTERNAL_PROMPT_EVENT,
  AI_AGENT_EXTERNAL_REQUEST_EVENT,
  clearPendingAgentRequest,
  consumePendingAgentRequest,
  normalizeAgentExternalRequest,
  type AgentExternalRequest,
} from "./external";

type RequestMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function toRequestMessages(messages: AgentChatMessage[]): RequestMessage[] {
  return messages
    .filter(
      (message): message is AgentChatMessage & { role: "user" | "assistant" } =>
        message.role === "user" || message.role === "assistant",
    )
    .slice(-14)
    .map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
    }));
}

export function useAiAgent(processId: string) {
  const apps = useOSStore((state) => state.apps);
  const processes = useOSStore((state) => state.processes);
  const windows = useOSStore((state) => state.windows);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const bootPhase = useOSStore((state) => state.bootPhase);
  const bootProgress = useOSStore((state) => state.bootProgress);
  const fsHydrated = useOSStore((state) => state.fsHydrated);

  const [messages, setMessages] = useState<AgentChatMessage[]>(() => clearAgentHistory());
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<AgentExternalRequest | null>(null);
  const [queuedRequests, setQueuedRequests] = useState<AgentExternalRequest[]>([]);
  const [historyHydrated, setHistoryHydrated] = useState(false);

  const runtimeSnapshot = useMemo(
    () =>
      buildAgentRuntimeSnapshot({
        apps: apps.map((app) => ({
          id: app.id,
          name: app.name,
          description: app.description,
        })),
        processes: processes.map((process) => ({
          id: process.id,
          appId: process.appId,
          name: process.name,
        })),
        windows: windows.map((window) => ({
          id: window.id,
          appId: window.appId,
          title: window.title,
          isMinimized: window.isMinimized,
        })),
        activeWindowId,
        bootPhase,
        bootProgress,
      }),
    [activeWindowId, apps, bootPhase, bootProgress, processes, windows],
  );

  useEffect(() => {
    if (!fsHydrated) {
      return;
    }

    let cancelled = false;

    const hydrateHistory = async () => {
      const storedHistory = await readStoredAgentHistory();

      if (!cancelled) {
        setMessages(storedHistory);
        setHistoryHydrated(true);
      }
    };

    void hydrateHistory();

    return () => {
      cancelled = true;
    };
  }, [fsHydrated]);

  useEffect(() => {
    if (!fsHydrated || !historyHydrated) {
      return;
    }

    void saveAgentHistory(messages);
  }, [fsHydrated, historyHydrated, messages]);

  const baseSuggestions = useMemo(
    () => [
      "Open terminal",
      "Explain Portfolio OS architecture",
      "What are your strongest skills?",
      "Open portfolio",
    ],
    [],
  );

  const suggestions = useMemo(() => {
    const nextSuggestions = [...(activeRequest?.suggestions ?? []), ...baseSuggestions];

    return [...new Set(nextSuggestions)].slice(0, 6);
  }, [activeRequest?.suggestions, baseSuggestions]);

  const hasUserMessages = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );

  const sendMessage = useCallback(
    async (forcedValue?: string) => {
      const nextValue = (forcedValue ?? input).trim();

      if (!nextValue || isStreaming) {
        return;
      }

      setError(null);

      const userMessage = createUserMessage(nextValue);
      const parsedCommand = parseAgentCommand(nextValue, apps);
      const assistantMessage = createAssistantMessage("", {
        action: parsedCommand.action,
      });
      const requestMessages = toRequestMessages([...messages, userMessage]);

      setMessages((current) => [...current, userMessage, assistantMessage]);
      setInput("");
      setIsStreaming(true);

      try {
        const response = await fetch("/api/ai-agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: requestMessages,
            runtime: runtimeSnapshot,
            requestedAction: describeRequestedAction(parsedCommand),
          }),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Agent request failed.");
        }

        const sources = response.headers
          .get("X-PortOS-Context")
          ?.split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const usedFallback = response.headers.get("X-PortOS-Fallback") === "local-context";
        const reader = response.body?.getReader();

        if (!reader) {
          throw new Error("Streaming response unavailable.");
        }

        const decoder = new TextDecoder();
        let finalText = "";

        while (true) {
          const chunk = await reader.read();

          if (chunk.done) {
            break;
          }

          finalText += decoder.decode(chunk.value, { stream: true });

          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: finalText,
                    sources,
                  }
                : message,
            ),
          );
        }

        if (!finalText.trim()) {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: "I hit an empty response. Ask again and I will retry.",
                    sources,
                  }
                : message,
            ),
          );
        }

        if (parsedCommand.action?.type === "OPEN_APP" && parsedCommand.action.payload.appId) {
          await openAppById(parsedCommand.action.payload.appId);
        }

        if (parsedCommand.action?.type === "OPEN_TOUR") {
          await openAppById("portfolio");
          await openAppById("resume");
          await openAppById("docs");
        }

        if (parsedCommand.action?.type === "OPEN_CONTACT_FLOW") {
          await openAppById("contact");
          await openAppById("resume");
          await openAppById("portfolio");
        }

        if (parsedCommand.action?.type === "OPEN_NOTES_DRAFT") {
          await openNotesWithPrefill({
            title: parsedCommand.action.payload.noteTitle ?? "New agent draft",
            body:
              (parsedCommand.action.payload.noteBody ?? "") +
              `Prompt: ${nextValue}\n\n`,
            tags: parsedCommand.action.payload.noteTags,
            pinned: false,
          });
        }

        const postActionMessage = buildPostActionSystemMessage(parsedCommand);

        if (postActionMessage && !usedFallback) {
          setMessages((current) => [...current, postActionMessage]);
        }
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : "Unknown agent error.";

        setError(message);
        setMessages((current) =>
          current
            .filter((entry) => entry.id !== assistantMessage.id)
            .concat(createSystemMessage(`Agent error: ${message}`)),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [apps, input, isStreaming, messages, runtimeSnapshot],
  );

  const applyExternalRequest = useCallback(
    (incoming: AgentExternalRequest | string) => {
      const request = normalizeAgentExternalRequest(incoming);

      if (!request.prompt.trim()) {
        return;
      }

      clearPendingAgentRequest();
      setActiveRequest(request);

      if (request.mode === "prefill") {
        setInput(request.prompt);
        return;
      }

      if (isStreaming) {
        setQueuedRequests((current) => [...current, request]);
        return;
      }

      void sendMessage(request.prompt);
    },
    [isStreaming, sendMessage],
  );

  useEffect(() => {
    const handleExternalPrompt = (event: Event) => {
      const prompt = (event as CustomEvent<string>).detail;

      if (!prompt) {
        return;
      }

      applyExternalRequest(prompt);
    };

    const handleExternalRequest = (event: Event) => {
      const request = (event as CustomEvent<AgentExternalRequest>).detail;

      if (!request) {
        return;
      }

      applyExternalRequest(request);
    };

    window.addEventListener(AI_AGENT_EXTERNAL_PROMPT_EVENT, handleExternalPrompt);
    window.addEventListener(AI_AGENT_EXTERNAL_REQUEST_EVENT, handleExternalRequest);

    return () => {
      window.removeEventListener(AI_AGENT_EXTERNAL_PROMPT_EVENT, handleExternalPrompt);
      window.removeEventListener(AI_AGENT_EXTERNAL_REQUEST_EVENT, handleExternalRequest);
    };
  }, [applyExternalRequest]);

  useEffect(() => {
    const pendingRequest = consumePendingAgentRequest();

    if (pendingRequest) {
      applyExternalRequest(pendingRequest);
    }
  }, [applyExternalRequest]);

  useEffect(() => {
    if (isStreaming || queuedRequests.length === 0) {
      return;
    }

    const [nextRequest, ...rest] = queuedRequests;

    setQueuedRequests(rest);
    setActiveRequest(nextRequest);

    if (nextRequest.mode === "prefill") {
      setInput(nextRequest.prompt);
      return;
    }

    void sendMessage(nextRequest.prompt);
  }, [isStreaming, queuedRequests, sendMessage]);

  return {
    processId,
    messages,
    input,
    setInput,
    isStreaming,
    error,
    suggestions,
    hasUserMessages,
    runtimeSnapshot,
    sendMessage,
    activeRequest,
    queuedRequestCount: queuedRequests.length,
    dismissActiveRequest: () => {
      setActiveRequest(null);
    },
    openRequestSource: async () => {
      if (activeRequest?.source?.appId) {
        await openAppById(activeRequest.source.appId);
      }
    },
    activeRequestSummary: buildAgentRequestSummary(activeRequest?.title, activeRequest?.source?.label),
    clearHistory: () => {
      const nextMessages = clearAgentHistory();
      setMessages(nextMessages);
      setError(null);
      setInput("");
      setActiveRequest(null);
      setQueuedRequests([]);
    },
  };
}
