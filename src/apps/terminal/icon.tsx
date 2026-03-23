import type { SVGProps } from "react";

export default function TerminalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="term-bg" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="term-prompt" x1="6" y1="9" x2="10" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dcfce7" />
          <stop offset="100%" stopColor="#bbf7d0" />
        </linearGradient>
        <radialGradient id="term-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="term-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#16a34a" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect x="2" y="3" width="20" height="18" rx="3" fill="url(#term-bg)" filter="url(#term-shadow)" />
      <rect x="2" y="3" width="20" height="18" rx="3" fill="url(#term-glow)" />
      <path d="M6 9l4 3-4 3" stroke="url(#term-prompt)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15h6" stroke="#dcfce7" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <rect x="2" y="3" width="10" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
