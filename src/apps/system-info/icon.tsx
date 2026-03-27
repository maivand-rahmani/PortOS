import type { SVGProps } from "react";

export default function SystemInfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="system-info-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
        <radialGradient id="system-info-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="system-info-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#111111" floodOpacity="0.28" />
        </filter>
      </defs>
      <rect x="2.5" y="3" width="19" height="18" rx="4" fill="url(#system-info-bg)" filter="url(#system-info-shadow)" />
      <rect x="2.5" y="3" width="19" height="18" rx="4" fill="url(#system-info-glow)" />
      <path d="M6.5 16.5V13" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d="M11.75 16.5V9" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d="M17 16.5V6.5" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d="M5.5 7.5h12" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <path d="M5.5 10.5h8" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
      <rect x="2.5" y="3" width="10" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
