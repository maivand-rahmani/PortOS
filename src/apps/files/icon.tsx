import type { SVGProps } from "react";

export default function FilesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="files-bg" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <radialGradient id="files-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="files-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#1d4ed8" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Folder back */}
      <path
        d="M2 7V19a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-7.172a2 2 0 01-1.414-.586L9.586 4.586A2 2 0 008.172 4H4a2 2 0 00-2 2v1z"
        fill="url(#files-bg)"
        filter="url(#files-shadow)"
      />
      {/* Folder front tab */}
      <path
        d="M2 7h8.828a2 2 0 011.414.586l.344.344"
        stroke="#93c5fd"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Specular glow */}
      <path
        d="M2 7V19a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-7.172a2 2 0 01-1.414-.586L9.586 4.586A2 2 0 008.172 4H4a2 2 0 00-2 2v1z"
        fill="url(#files-glow)"
      />
      {/* Document lines inside folder */}
      <path d="M7 13h10" stroke="#bfdbfe" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <path d="M7 16h6" stroke="#bfdbfe" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
      {/* Glass highlight */}
      <rect x="2" y="3" width="10" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
