import { Mistral } from "@mistralai/mistralai";
import type {
  ChatCompletionRequestMessage,
  CompletionEvent,
  ContentChunk,
  ThinkChunk,
} from "@mistralai/mistralai/models/components";
import * as mistralErrors from "@mistralai/mistralai/models/errors";

export const DEFAULT_MISTRAL_MODEL_ID = "mistral-small-latest";

function isInvalidChatModelId(modelId: string) {
  const normalized = modelId.trim().toLowerCase();

  return normalized.includes("embed");
}

export function getMistralApiKey() {
  const apiKey = process.env.MISTRAL_API_KEY?.trim();

  return apiKey || null;
}

export function getMistralModelId() {
  const modelId = process.env.MISTRAL_MODEL_ID?.trim();

  if (!modelId) {
    return DEFAULT_MISTRAL_MODEL_ID;
  }

  if (isInvalidChatModelId(modelId)) {
    console.warn(
      `MISTRAL_MODEL_ID="${modelId}" is not a chat model. Falling back to ${DEFAULT_MISTRAL_MODEL_ID}.`,
    );

    return DEFAULT_MISTRAL_MODEL_ID;
  }

  return modelId;
}

export function createMistralClient(apiKey: string) {
  return new Mistral({ apiKey });
}

function extractThinkingText(chunks: ThinkChunk["thinking"]) {
  return chunks
    .map((chunk) =>
      "text" in chunk && typeof chunk.text === "string" ? chunk.text : "",
    )
    .join("");
}

function extractChunkText(chunk: ContentChunk) {
  if (chunk.type === "text") {
    return chunk.text;
  }

  if (chunk.type === "thinking") {
    return extractThinkingText(chunk.thinking);
  }

  return "";
}

export function extractMistralContentText(
  content: string | Array<ContentChunk> | null | undefined,
) {
  if (typeof content === "string") {
    return content;
  }

  if (!content) {
    return "";
  }

  return content.map(extractChunkText).join("");
}

export function extractMistralStreamText(event: CompletionEvent) {
  return extractMistralContentText(event.data?.choices[0]?.delta?.content);
}

export function buildMistralErrorMessage(error: unknown) {
  if (error instanceof mistralErrors.MistralError) {
    switch (error.statusCode) {
      case 401:
        return "Mistral authentication failed. Check `MISTRAL_API_KEY`.";
      case 402:
        return "Mistral request requires plan or billing access.";
      case 429:
        return "Mistral rate limit hit. Try again in a moment.";
      case 400:
      case 422:
        return "Mistral request failed.";
      default:
        if (error.statusCode >= 500) {
          return "Mistral service is temporarily unavailable.";
        }

        return "Mistral request failed.";
    }
  }

  return "Unexpected Mistral error.";
}

export function isTransientMistralError(error: unknown) {
  if (
    error instanceof mistralErrors.ConnectionError ||
    error instanceof mistralErrors.RequestTimeoutError ||
    error instanceof mistralErrors.RequestAbortedError
  ) {
    return true;
  }

  if (error instanceof mistralErrors.MistralError) {
    return error.statusCode === 429 || error.statusCode >= 500;
  }

  return false;
}

export type { ChatCompletionRequestMessage };
