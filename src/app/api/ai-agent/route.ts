import { OpenRouter } from "@openrouter/sdk";
import type { Message } from "@openrouter/sdk/models";
import * as openRouterErrors from "@openrouter/sdk/models/errors";

import { buildAiAgentContext } from "@/shared/server/ai-agent-context";
import {
  validateAgentRequest,
  detectPromptInjection,
  createPlainTextError,
} from "@/shared/server/api-guard";
import type { AgentRequestMessageInput } from "@/shared/server/api-guard";

export const runtime = "nodejs";

const MODEL_ID = "openrouter/free";

const GRATITUDE_PATTERN = /^(thanks|thank you|thx|ty|appreciate it|nice|good job|great|cool|ok thanks)[!.\s]*$/i;

function buildShortHumanReply(userMessage: string) {
  const normalized = userMessage.trim().toLowerCase();

  if (GRATITUDE_PATTERN.test(normalized)) {
    if (normalized.includes("good job") || normalized.includes("great") || normalized.includes("nice") || normalized.includes("cool")) {
      return "yeah";
    }

    return "please";
  }

  return null;
}

function sanitizeAssistantReply(reply: string, userMessage: string) {
  const shortReply = buildShortHumanReply(userMessage);

  if (shortReply) {
    return shortReply;
  }

  const normalized = reply
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\b(Glad you liked it\.?|I'?m glad you liked it\.?)/gi, "")
    .replace(/\b(If you want to dive deeper into any of the topics[^.?!]*[.?!]?)/gi, "")
    .replace(/\b(Let me know if you want more details[^.?!]*[.?!]?)/gi, "")
    .replace(/\b(Feel free to ask if you need anything else[^.?!]*[.?!]?)/gi, "")
    .trim();

  return normalized || reply.trim();
}

function buildHumanFallbackResponse(userMessage: string) {
  const normalized = userMessage.trim().toLowerCase();

  if (normalized.includes("hire") || normalized.includes("client") || normalized.includes("contact")) {
    return "Because I think wider than just UI. I care about structure, product logic, and real implementation, and this portfolio itself is proof of that. If you want, open Portfolio, Resume, and Contact together and you will see how I package the whole experience, not just screens.";
  }

  if (normalized.includes("skill")) {
    return "My strongest side is architecture-first frontend work. I usually think in systems, flows, and maintainability first, then in visuals. AI also helps me move faster, but I still care about real structure and decision-making.";
  }

  if (normalized.includes("portfolio") || normalized.includes("project") || normalized.includes("portos")) {
    return "PortOS matters because it is not a flat portfolio. It behaves like a small operating system with apps, windows, runtime state, and an agent on top. That shows how I think about product structure, not just presentation.";
  }

  return "The provider is limited right now, so I am answering from local context. Ask directly and I will keep it practical.";
}

function buildFallbackResponse(userMessage: string, fallbackBrief: string) {
  const directReply = buildHumanFallbackResponse(userMessage);

  if (!fallbackBrief.trim()) {
    return directReply;
  }

  return directReply;
}

function buildErrorMessage(error: unknown) {
  if (error instanceof openRouterErrors.UnauthorizedResponseError) {
    return "OpenRouter authentication failed. Check `OPENROUTER_API_KEY`.";
  }

  if (error instanceof openRouterErrors.TooManyRequestsResponseError) {
    return "OpenRouter rate limit hit. Try again in a moment.";
  }

  if (
    error instanceof openRouterErrors.BadRequestResponseError ||
    error instanceof openRouterErrors.InternalServerResponseError ||
    error instanceof openRouterErrors.OpenRouterError
  ) {
    const errorBody = error.body?.trim();

    return errorBody || error.message || "OpenRouter request failed.";
  }

  return error instanceof Error ? error.message : "Unexpected AI agent error.";
}

function buildConversation(messages: AgentRequestMessageInput[], systemPrompt: string): Message[] {
  return [
    {
      role: "system",
      content: systemPrompt,
    },
    ...messages.map((message): Message =>
      message.role === "assistant"
        ? {
            role: "assistant",
            content: message.content,
          }
        : {
            role: "user",
            content: message.content,
          },
    ),
  ];
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validated = validateAgentRequest(rawBody);

    if (!validated) {
      return createPlainTextError("Invalid agent request format.", 400);
    }

    const messages = validated.messages.filter((message) => message.content.trim());
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content;

    if (!latestUserMessage) {
      return createPlainTextError("Missing user message.", 400);
    }

    if (detectPromptInjection(latestUserMessage)) {
      return createPlainTextError("Message contains disallowed patterns.", 400);
    }

    const shortReply = buildShortHumanReply(latestUserMessage);

    if (shortReply) {
      return new Response(shortReply, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-PortOS-Context": "identity-short-reply",
        },
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response("OPENROUTER_API_KEY is not configured on the server.", { status: 500 });
    }

    const context = await buildAiAgentContext({
      userMessage: latestUserMessage,
      runtime: validated.runtime,
      requestedAction: validated.requestedAction,
    });

    const client = new OpenRouter({ apiKey });
    let stream;

    try {
      stream = await client.chat.send({
        chatGenerationParams: {
          model: MODEL_ID,
          messages: buildConversation(messages, context.systemPrompt),
          temperature: 0.55,
          stream: true,
          provider: {
            allowFallbacks: true,
          },
        },
      });
    } catch (providerError) {
      const encoder = new TextEncoder();
      const fallbackText = buildFallbackResponse(latestUserMessage, context.fallbackBrief);
      const providerMessage = buildErrorMessage(providerError);

      return new Response(encoder.encode(fallbackText), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-PortOS-Context": context.contextPreview.join(", "),
          "X-PortOS-Provider-Error": providerMessage,
          "X-PortOS-Fallback": "local-context",
        },
      });
    }

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            let combinedText = "";

            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta?.content;

              if (delta) {
                combinedText += delta;
              }
            }

            controller.enqueue(encoder.encode(sanitizeAssistantReply(combinedText, latestUserMessage)));

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
          "X-PortOS-Context": context.contextPreview.join(", "),
        },
      },
    );
  } catch (error) {
    const message = buildErrorMessage(error);

    return new Response(message, { status: 500 });
  }
}
