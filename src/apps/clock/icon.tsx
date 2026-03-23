import type { SVGProps } from "react";

export default function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="clock-ring" x1="2.5" y1="2.5" x2="21.5" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <radialGradient id="clock-face" cx="12" cy="11" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
        <radialGradient id="clock-glow" cx="10" cy="8" r="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="clock-hands" x1="12" y1="6" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <filter id="clock-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#475569" floodOpacity="0.3" />
        </filter>
      </defs>
      <circle cx="12" cy="12" r="9.5" fill="url(#clock-ring)" filter="url(#clock-shadow)" />
      <circle cx="12" cy="12" r="8.5" fill="url(#clock-face)" />
      <circle cx="12" cy="12" r="8.5" fill="url(#clock-glow)" />
      <path d="M12 6.5v5.5l3.5 3" stroke="url(#clock-hands)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.2" fill="#1e293b" />
      <circle cx="12" cy="12" r="0.5" fill="#f8fafc" />
    </svg>
  );
}
