import type { SVGProps } from "react";

export default function NotesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="notes-bg" x1="2" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
        <linearGradient id="notes-fold" x1="16" y1="4" x2="20" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <radialGradient id="notes-glow" cx="8" cy="8" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="notes-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#ca8a04" floodOpacity="0.3" />
        </filter>
      </defs>
      <path d="M4 4h12l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" fill="url(#notes-bg)" filter="url(#notes-shadow)" />
      <path d="M4 4h12l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" fill="url(#notes-glow)" />
      <path d="M16 4v4h4" fill="url(#notes-fold)" />
      <path d="M7 11h6" stroke="#ca8a04" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <path d="M7 15h4" stroke="#ca8a04" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <rect x="2" y="3" width="10" height="7" rx="3" fill="white" opacity="0.18" />
    </svg>
  );
}
