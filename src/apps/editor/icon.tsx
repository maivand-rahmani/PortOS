import type { SVGProps } from "react";

export default function EditorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="editor-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="editor-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="editor-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#5b21b6" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Document body */}
      <rect
        x="4"
        y="2"
        width="16"
        height="20"
        rx="3"
        fill="url(#editor-bg)"
        filter="url(#editor-shadow)"
      />
      {/* Specular glow */}
      <rect
        x="4"
        y="2"
        width="16"
        height="20"
        rx="3"
        fill="url(#editor-glow)"
      />
      {/* Text lines */}
      <path d="M8 7h8" stroke="#e9d5ff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <path d="M8 10.5h6" stroke="#e9d5ff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <path d="M8 14h7" stroke="#e9d5ff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      {/* Cursor / caret accent */}
      <path d="M15 14v3" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      {/* Glass highlight */}
      <rect x="4" y="2" width="10" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
