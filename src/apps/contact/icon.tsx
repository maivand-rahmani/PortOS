import type { SVGProps } from "react";

export default function ContactIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="contact-bg" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="contact-fold" x1="3" y1="7" x2="21" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <radialGradient id="contact-glow" cx="8" cy="8" r="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="contact-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#0284c7" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect x="2" y="4" width="20" height="16" rx="3" fill="url(#contact-bg)" filter="url(#contact-shadow)" />
      <rect x="2" y="4" width="20" height="16" rx="3" fill="url(#contact-glow)" />
      <path d="M3 7l8.5 6L21 7" stroke="url(#contact-fold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="4" width="10" height="8" rx="3" fill="white" opacity="0.12" />
    </svg>
  );
}
