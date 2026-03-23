import type { SVGProps } from "react";

export default function BlogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="blog-bg" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="blog-lines" x1="7" y1="7" x2="17" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#ddd6fe" />
        </linearGradient>
        <radialGradient id="blog-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="blog-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#7c3aed" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect x="2" y="3" width="20" height="18" rx="3" fill="url(#blog-bg)" filter="url(#blog-shadow)" />
      <rect x="2" y="3" width="20" height="18" rx="3" fill="url(#blog-glow)" />
      <path d="M7 7h10" stroke="url(#blog-lines)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 11h10" stroke="#ddd6fe" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <path d="M7 15h6" stroke="#ddd6fe" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      <path d="M17 13v6" stroke="#ede9fe" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 16h6" stroke="#ede9fe" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="2" y="3" width="10" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
