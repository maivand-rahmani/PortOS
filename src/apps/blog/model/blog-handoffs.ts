import type { BlogPost } from "@/shared/lib/app-logic";
import type { AgentExternalRequest } from "@/shared/lib/agent-os-events";
import type { NotesExternalRequestDetail } from "@/shared/lib/notes-os-events";
import type { PortfolioFocusRequest } from "@/shared/lib/portfolio-os-events";

import type { BlogHighlight } from "./blog-reader-storage";

const PORTFOLIO_OS_TOKENS = ["portfolio", "product", "frontend", "ux", "windows", "motion", "system-design", "ai"];
const ECOMMERCE_TOKENS = ["e-commerce", "commerce", "admin", "full-stack", "nextjs"];

function formatHighlightLine(highlight: BlogHighlight, index: number) {
  const parts = [];

  if (highlight.quote) {
    parts.push(`Quote: ${highlight.quote}`);
  }

  if (highlight.note) {
    parts.push(`Note: ${highlight.note}`);
  }

  return `${index + 1}. ${parts.join(" | ")}`;
}

export function buildBlogNoteRequest(post: BlogPost, highlights: BlogHighlight[]): NotesExternalRequestDetail {
  return {
    mode: "create",
    title: `${post.title} - reading brief`,
    body: [
      `Reading brief for ${post.title}`,
      `Published: ${post.publishedAt}`,
      `Tags: ${post.tags.join(", ")}`,
      "",
      "Summary:",
      post.excerpt,
      "",
      "Post body:",
      post.body,
      "",
      highlights.length > 0 ? "Saved highlights:" : "Saved highlights: none yet",
      ...(highlights.length > 0 ? highlights.map(formatHighlightLine) : []),
      "",
      "Follow-up:",
      "- [ ] Turn one idea into a portfolio talking point",
      "- [ ] Ask the AI agent for a sharper explanation",
      "- [ ] Revisit the related case study in Portfolio",
    ].join("\n"),
    tags: ["blog", post.id, ...post.tags.slice(0, 4)],
    pinned: false,
    selectAfterWrite: true,
    source: `blog:${post.id}`,
  };
}

export function buildBlogAgentRequest(post: BlogPost, highlights: BlogHighlight[]): AgentExternalRequest {
  const highlightSection =
    highlights.length > 0
      ? highlights.map(formatHighlightLine).join("\n")
      : "No saved highlights yet. Focus on the post itself and suggest what should be captured.";

  return {
    title: `${post.title} discussion`,
    prompt: [
      `I am reading the blog post \"${post.title}\".`,
      `Published: ${post.publishedAt}`,
      `Tags: ${post.tags.join(", ")}`,
      "",
      `Excerpt: ${post.excerpt}`,
      `Body: ${post.body}`,
      "",
      "Saved highlights:",
      highlightSection,
      "",
      "Please explain the strongest practical lesson in plain language, then give me:",
      "1. one interview talking point,",
      "2. one portfolio positioning angle,",
      "3. one follow-up question worth exploring.",
    ].join("\n"),
    mode: "send",
    source: {
      appId: "blog",
      label: post.title,
    },
    suggestions: [
      `Turn ${post.title} into an interview story.`,
      `What product lesson is strongest in ${post.title}?`,
      `How does ${post.title} connect to Portfolio OS?`,
    ],
  };
}

export function resolveBlogPortfolioFocus(post: BlogPost): { label: string; request: PortfolioFocusRequest } | null {
  const normalizedTags = post.tags.map((tag) => tag.toLowerCase());

  if (normalizedTags.some((tag) => PORTFOLIO_OS_TOKENS.includes(tag))) {
    return {
      label: "Portfolio OS case study",
      request: {
        projectId: "portfolio-os",
        filterId: "portfolio",
        source: `blog:${post.id}`,
      },
    };
  }

  if (normalizedTags.some((tag) => ECOMMERCE_TOKENS.includes(tag))) {
    return {
      label: "Crazy eCommerce case study",
      request: {
        projectId: "crazy-ecommerce-project",
        filterId: "nextjs",
        source: `blog:${post.id}`,
      },
    };
  }

  return null;
}
