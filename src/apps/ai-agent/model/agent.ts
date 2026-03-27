"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useOSStore } from "@/processes";
import { openAppById, openNotesWithPrefill } from "@/shared/lib";

import { describeRequestedAction, parseAgentCommand } from "./commandParser";
import {
  buildAgentRuntimeSnapshot,
  buildPostActionSystemMessage,
  clearAgentHistory,
  consumePendingAgentPrompt,
  createAssistantMessage,
  createSystemMessage,
  createUserMessage,
  AI_AGENT_EXTERNAL_PROMPT_EVENT,
  readStoredAgentHistory,
  saveAgentHistory,
  type AgentChatMessage,
} from "./contextLoader";

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

  const [messages, setMessages] = useState<AgentChatMessage[]>(() => readStoredAgentHistory());
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    saveAgentHistory(messages);
  }, [messages]);

  const suggestions = useMemo(
    () => [
      "Open terminal",
      "Explain Portfolio OS architecture",
      "What are your strongest skills?",
      "Open portfolio",
    ],
    [],
  );

  const sendMessage = useCallback(async (forcedValue?: string) => {
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
      const providerError = response.headers.get("X-PortOS-Provider-Error");
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
  }, [
    apps,
    input,
    isStreaming,
    messages,
    runtimeSnapshot,
  ]);

  useEffect(() => {
    const handleExternalPrompt = (event: Event) => {
      const prompt = (event as CustomEvent<string>).detail;

      if (!prompt) {
        return;
      }

      void sendMessage(prompt);
    };

    window.addEventListener(AI_AGENT_EXTERNAL_PROMPT_EVENT, handleExternalPrompt);

    return () => {
      window.removeEventListener(AI_AGENT_EXTERNAL_PROMPT_EVENT, handleExternalPrompt);
    };
  }, [sendMessage]);

  useEffect(() => {
    const pendingPrompt = consumePendingAgentPrompt();

    if (pendingPrompt) {
      void sendMessage(pendingPrompt);
    }
  }, [sendMessage]);

  return {
    processId,
    messages,
    input,
    setInput,
    isStreaming,
    error,
    suggestions,
    runtimeSnapshot,
    sendMessage,
    clearHistory: () => {
      const nextMessages = clearAgentHistory();
      setMessages(nextMessages);
      setError(null);
      setInput("");
    },
  };
}
