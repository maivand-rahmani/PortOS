"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

// ── Types ───────────────────────────────────────────────

type EditorPreviewProps = {
  content: string;
};

// ── Minimal Markdown Renderer ───────────────────────────
// Lightweight inline renderer - no external dependencies.
// Handles the most common markdown constructs.

function renderMarkdownToHTML(source: string): string {
  const lines = source.split("\n");
  const htmlLines: string[] = [];
  let inCodeBlock = false;
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Fenced code blocks
    if (line.trimStart().startsWith("```")) {
      if (inCodeBlock) {
        htmlLines.push("</code></pre>");
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        htmlLines.push('<pre class="ep-code-block"><code>');
      }

      continue;
    }

    if (inCodeBlock) {
      htmlLines.push(escapeHTML(line));

      continue;
    }

    // Close open lists if needed
    if (inList && !line.match(/^\s*[-*+]\s/)) {
      htmlLines.push("</ul>");
      inList = false;
    }

    if (inOrderedList && !line.match(/^\s*\d+\.\s/)) {
      htmlLines.push("</ol>");
      inOrderedList = false;
    }

    // Empty line
    if (line.trim() === "") {
      htmlLines.push("<br />");

      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;

      htmlLines.push(
        `<h${level} class="ep-h${level}">${renderInline(headingMatch[2])}</h${level}>`,
      );

      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      htmlLines.push(
        `<blockquote class="ep-blockquote">${renderInline(line.slice(2))}</blockquote>`,
      );

      continue;
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      htmlLines.push('<hr class="ep-hr" />');

      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^\s*[-*+]\s+(.+)$/);

    if (ulMatch) {
      if (!inList) {
        htmlLines.push('<ul class="ep-ul">');
        inList = true;
      }

      htmlLines.push(`<li>${renderInline(ulMatch[1])}</li>`);

      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\s*\d+\.\s+(.+)$/);

    if (olMatch) {
      if (!inOrderedList) {
        htmlLines.push('<ol class="ep-ol">');
        inOrderedList = true;
      }

      htmlLines.push(`<li>${renderInline(olMatch[1])}</li>`);

      continue;
    }

    // Paragraph
    htmlLines.push(`<p class="ep-p">${renderInline(line)}</p>`);
  }

  // Close any open blocks
  if (inCodeBlock) {
    htmlLines.push("</code></pre>");
  }

  if (inList) {
    htmlLines.push("</ul>");
  }

  if (inOrderedList) {
    htmlLines.push("</ol>");
  }

  return htmlLines.join("\n");
}

function renderInline(text: string): string {
  let result = escapeHTML(text);

  // Images: ![alt](src)
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="ep-img" />',
  );

  // Links: [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="ep-link" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Bold: **text** or __text__
  result = result.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="ep-bold">$1</strong>',
  );
  result = result.replace(
    /__(.+?)__/g,
    '<strong class="ep-bold">$1</strong>',
  );

  // Italic: *text* or _text_
  result = result.replace(/\*(.+?)\*/g, '<em class="ep-italic">$1</em>');
  result = result.replace(
    /(?<!\w)_(.+?)_(?!\w)/g,
    '<em class="ep-italic">$1</em>',
  );

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del class="ep-del">$1</del>');

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="ep-inline-code">$1</code>');

  return result;
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Component ───────────────────────────────────────────

export function EditorPreview({ content }: EditorPreviewProps) {
  const html = useMemo(() => {
    const raw = renderMarkdownToHTML(content);
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "s", "code", "pre",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "blockquote", "hr",
        "a", "img", "span", "div", "del",
      ],
      ALLOWED_ATTR: ["class", "href", "src", "alt", "target", "rel"],
    });
  }, [content]);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 min-h-0 border-l"
      style={{
        borderColor: "var(--editor-preview-border)",
        background: "var(--editor-canvas-bg)",
      }}
    >
      <div
        className="ep-root max-w-none prose-sm"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          color: "var(--editor-text)",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      />
      <style>{`
        .ep-root { font-family: inherit; }
        .ep-h1 { font-size: 1.5em; font-weight: 700; margin: 0.8em 0 0.4em; border-bottom: 1px solid var(--editor-border); padding-bottom: 0.3em; }
        .ep-h2 { font-size: 1.3em; font-weight: 600; margin: 0.7em 0 0.3em; }
        .ep-h3 { font-size: 1.1em; font-weight: 600; margin: 0.6em 0 0.3em; }
        .ep-h4, .ep-h5, .ep-h6 { font-size: 1em; font-weight: 600; margin: 0.5em 0 0.2em; }
        .ep-p { margin: 0.4em 0; }
        .ep-bold { font-weight: 600; }
        .ep-italic { font-style: italic; }
        .ep-del { text-decoration: line-through; opacity: 0.6; }
        .ep-link { color: var(--editor-accent); text-decoration: underline; text-underline-offset: 2px; }
        .ep-link:hover { opacity: 0.8; }
        .ep-inline-code {
          background: var(--editor-accent-light);
          color: var(--editor-accent);
          padding: 0.15em 0.35em;
          border-radius: 4px;
          font-family: var(--font-industrial-mono, monospace);
          font-size: 0.9em;
        }
        .ep-code-block {
          background: #1e1b4b;
          color: #e9d5ff;
          padding: 0.8em 1em;
          border-radius: 8px;
          font-family: var(--font-industrial-mono, monospace);
          font-size: 0.85em;
          line-height: 1.6;
          overflow-x: auto;
          margin: 0.6em 0;
        }
        .ep-code-block code { background: transparent; color: inherit; padding: 0; }
        .ep-blockquote {
          border-left: 3px solid var(--editor-accent);
          padding-left: 0.8em;
          margin: 0.5em 0;
          color: var(--editor-text-secondary);
          font-style: italic;
        }
        .ep-ul, .ep-ol { padding-left: 1.5em; margin: 0.4em 0; }
        .ep-ul { list-style-type: disc; }
        .ep-ol { list-style-type: decimal; }
        .ep-ul li, .ep-ol li { margin: 0.15em 0; }
        .ep-hr { border: none; border-top: 1px solid var(--editor-border); margin: 1em 0; }
        .ep-img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
      `}</style>
    </div>
  );
}
