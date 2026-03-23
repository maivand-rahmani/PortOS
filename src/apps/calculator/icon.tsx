import type { SVGProps } from "react";

export default function CalculatorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="calc-bg" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="calc-screen" x1="7" y1="5" x2="17" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#ffedd5" />
        </linearGradient>
        <radialGradient id="calc-glow" cx="8" cy="6" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="calc-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#ea580c" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect x="4" y="2" width="16" height="20" rx="3" fill="url(#calc-bg)" filter="url(#calc-shadow)" />
      <rect x="4" y="2" width="16" height="20" rx="3" fill="url(#calc-glow)" />
      <rect x="7" y="5" width="10" height="4" rx="1.5" fill="url(#calc-screen)" />
      <circle cx="9" cy="13" r="1.2" fill="#ffedd5" opacity="0.9" />
      <circle cx="15" cy="13" r="1.2" fill="#ffedd5" opacity="0.9" />
      <circle cx="9" cy="17" r="1.2" fill="#ffedd5" opacity="0.9" />
      <circle cx="15" cy="17" r="1.2" fill="#ffedd5" opacity="0.9" />
      <rect x="4" y="2" width="8" height="6" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
