import { OpenRouter } from "@openrouter/sdk";
import * as openRouterErrors from "@openrouter/sdk/models/errors";

import {
  validateAiServiceRequest,
  detectPromptInjection,
  createPlainTextError,
} from "@/shared/server/api-guard";

export const runtime = "nodejs";

type AiServiceActionId =
  | "summarize"
  | "explain"
  | "generate"
  | "modify"
  | "refactor"
  | "organize";

type AiServiceRouteRequest = {
  action: AiServiceActionId;
  content: string;
  prompt: string;
  fileName: string | null;
  mimeType: string | null;
};

const MODEL_ID = "openrouter/free";

const SYSTEM_PROMPTS: Record<AiServiceActionId, string> = {
  summarize: [
    "You are a concise technical summarizer.",
    "Create a clear, well-structured summary of the provided content.",
    "Focus on key points, important details, and main ideas.",
    "Use bullet points when the content has multiple distinct topics.",
    "Keep the summary significantly shorter than the original.",
    "Do not add opinions or information not present in the content.",
  ].join("\n"),
  explain: [
    "You are a technical explainer.",
    "Explain the provided content in clear, accessible language.",
    "If the content is code, explain what it does, how it works, and why specific patterns are used.",
    "If the content is text, explain its meaning, structure, and purpose.",
    "Use examples or analogies when they genuinely help understanding.",
    "Be thorough but not verbose.",
  ].join("\n"),
  generate: [
    "You are a content generator.",
    "Generate new content based on the provided context and the user's instructions.",
    "Match the style, format, and conventions of the provided context.",
    "If generating code, ensure it is correct, well-typed, and follows the same patterns.",
    "If generating text, match the tone and structure of the original.",
    "Return only the generated content — no explanations or wrapper text.",
  ].join("\n"),
  modify: [
    "You are a content improver.",
    "Rewrite and improve the provided content based on the user's instructions.",
    "Preserve the original intent, meaning, and structure unless the user asks otherwise.",
    "For code: fix bugs, improve readability, add types, optimize where appropriate.",
    "For text: improve clarity, grammar, structure, and flow.",
    "Return only the modified content — no explanations or diff markers.",
  ].join("\n"),
  refactor: [
    "You are a code refactoring expert.",
    "Restructure the provided code to improve readability, maintainability, and patterns.",
    "Do not change external behavior — only internal structure.",
    "Apply clean code principles: single responsibility, clear naming, minimal nesting.",
    "Preserve the same language, framework conventions, and type safety.",
    "Return only the refactored code — no explanations or wrapper text.",
  ].join("\n"),
  organize: [
    "You are a content organizer.",
    "Reorganize the provided content for better structure and clarity.",
    "Group related items together, add clear headings or sections if appropriate.",
    "For code: reorder declarations logically, group imports, organize exports.",
    "For text/notes: create logical sections, order by importance or topic.",
    "Return only the reorganized content — no explanations or wrapper text.",
  ].join("\n"),
};

function buildSystemPrompt(action: AiServiceActionId, fileName: string | null, mimeType: string | null): string {
  const base = SYSTEM_PROMPTS[action];

  const contextLines: string[] = [];

  if (fileName) {
    contextLines.push(`File: ${fileName}`);
  }

  if (mimeType) {
    contextLines.push(`Type: ${mimeType}`);
  }

  if (contextLines.length > 0) {
    return `${base}\n\nContext:\n${contextLines.join("\n")}`;
  }

  return base;
}

function buildErrorMessage(error: unknown): string {
  if (error instanceof openRouterErrors.UnauthorizedResponseError) {
    return "OpenRouter authentication failed. Check OPENROUTER_API_KEY.";
  }

  if (error instanceof openRouterErrors.TooManyRequestsResponseError) {
    return "Rate limit reached. Try again in a moment.";
  }

  if (
    error instanceof openRouterErrors.BadRequestResponseError ||
    error instanceof openRouterErrors.InternalServerResponseError ||
    error instanceof openRouterErrors.OpenRouterError
  ) {
    const errorBody = error.body?.trim();

    return errorBody || error.message || "OpenRouter request failed.";
  }

  return error instanceof Error ? error.message : "Unexpected AI service error.";
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validated = validateAiServiceRequest(rawBody);

    if (!validated) {
      return createPlainTextError("Invalid AI service request format.", 400);
    }

    if (detectPromptInjection(validated.prompt) || detectPromptInjection(validated.content)) {
      return createPlainTextError("Message contains disallowed patterns.", 400);
    }

    const body = validated as AiServiceRouteRequest;

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response("OPENROUTER_API_KEY is not configured on the server.", { status: 500 });
    }

    const systemPrompt = buildSystemPrompt(body.action, body.fileName, body.mimeType);

    const userMessage = body.content
      ? `${body.prompt}\n\n---\n\n${body.content}`
      : body.prompt;

    const client = new OpenRouter({ apiKey });

    let stream;

    try {
      stream = await client.chat.send({
        chatGenerationParams: {
          model: MODEL_ID,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
          stream: true,
          provider: {
            allowFallbacks: true,
          },
        },
      });
    } catch (providerError) {
      const message = buildErrorMessage(providerError);

      return new Response(message, {
        status: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-PortOS-Provider-Error": message,
        },
      });
    }

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta?.content;

              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            }

            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-PortOS-Action": body.action,
        },
      },
    );
  } catch (error) {
    const message = buildErrorMessage(error);

    return new Response(message, { status: 500 });
  }
}
