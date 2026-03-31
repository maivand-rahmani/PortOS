"use client";

import type { FileSystemNode } from "@/entities/file-system";
import { cn } from "@/shared/lib";

import { filesRadii } from "../files-ui";

// ── Icon helpers ────────────────────────────────────────

const EXTENSION_ICONS: Record<string, string> = {
  txt: "doc-text",
  md: "doc-md",
  json: "doc-json",
  csv: "doc-csv",
  html: "doc-html",
  css: "doc-css",
  ts: "doc-ts",
  tsx: "doc-tsx",
  js: "doc-js",
  jsx: "doc-jsx",
};

function getFileIconClass(node: FileSystemNode): string {
  if (node.type === "directory") {
    return "folder";
  }

  if (node.type === "file") {
    return EXTENSION_ICONS[node.extension] ?? "doc-generic";
  }

  return "doc-generic";
}

// ── File Icon SVG ───────────────────────────────────────

function DirectoryIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
      <path
        d="M2 8V26a2 2 0 002 2h24a2 2 0 002-2V12a2 2 0 00-2-2H15.172a2 2 0 01-1.414-.586L11.586 7.243A2 2 0 0010.172 6.656H4a2 2 0 00-2 2V8z"
        fill="#60a5fa"
      />
      <path
        d="M2 12h28v14a2 2 0 01-2 2H4a2 2 0 01-2-2V12z"
        fill="#3b82f6"
      />
      <rect x="2" y="8" width="14" height="6" rx="2" fill="white" opacity="0.15" />
    </svg>
  );
}

function FileIcon({ extension }: { extension: string }) {
  const colors: Record<string, { bg: string; accent: string }> = {
    md: { bg: "#6366f1", accent: "#a5b4fc" },
    json: { bg: "#f59e0b", accent: "#fde68a" },
    txt: { bg: "#64748b", accent: "#cbd5e1" },
    ts: { bg: "#3178c6", accent: "#93c5fd" },
    tsx: { bg: "#3178c6", accent: "#93c5fd" },
    js: { bg: "#f7df1e", accent: "#fef9c3" },
    jsx: { bg: "#f7df1e", accent: "#fef9c3" },
    html: { bg: "#e34f26", accent: "#fca5a5" },
    css: { bg: "#1572b6", accent: "#93c5fd" },
    csv: { bg: "#22c55e", accent: "#bbf7d0" },
  };

  const color = colors[extension] ?? { bg: "#94a3b8", accent: "#e2e8f0" };
  const label = extension.toUpperCase().slice(0, 4) || "FILE";

  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
      <path
        d="M6 2h14l6 6v20a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <path d="M20 2v6h6" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
      <rect x="7" y="20" width="18" height="8" rx="2" fill={color.bg} />
      <text
        x="16"
        y="26"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill="white"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

// ── Node Icon Component ─────────────────────────────────

export function NodeIcon({ node, size = 40 }: { node: FileSystemNode; size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="flex-shrink-0">
      {node.type === "directory" ? (
        <DirectoryIcon />
      ) : (
        <FileIcon extension={node.type === "file" ? node.extension : ""} />
      )}
    </div>
  );
}

// ── Formatted metadata ──────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);

  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatNodeDate(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export function formatNodeDateShort(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}
