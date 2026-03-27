import type { SVGProps } from "react";

export default function PortfolioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="portfolio-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
        <linearGradient id="portfolio-lines" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <radialGradient id="portfolio-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="portfolio-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#18181b" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect x="2" y="3" width="20" height="18" rx="4" fill="url(#portfolio-bg)" filter="url(#portfolio-shadow)" />
      <rect x="2" y="3" width="20" height="18" rx="4" fill="url(#portfolio-glow)" />
      <path d="M6.5 8.5h11" stroke="url(#portfolio-lines)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 12h7" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <path d="M6.5 15.5h4" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.62" />
      <rect x="14.5" y="11.5" width="3.5" height="4" rx="1" fill="#f59e0b" opacity="0.9" />
      <rect x="2" y="3" width="10" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
