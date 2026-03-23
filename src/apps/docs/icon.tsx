import type { SVGProps } from "react";

export default function DocsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="docs-bg" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="docs-spine" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <radialGradient id="docs-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="docs-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#2563eb" floodOpacity="0.35" />
        </filter>
      </defs>
      <path d="M2 4.5C2 3.67 2.67 3 3.5 3h17c.83 0 1.5.67 1.5 1.5v15c0 .83-.67 1.5-1.5 1.5h-17C2.67 21 2 20.33 2 19.5z" fill="url(#docs-bg)" filter="url(#docs-shadow)" />
      <path d="M2 4.5C2 3.67 2.67 3 3.5 3h17c.83 0 1.5.67 1.5 1.5v15c0 .83-.67 1.5-1.5 1.5h-17C2.67 21 2 20.33 2 19.5z" fill="url(#docs-glow)" />
      <path d="M12 3v18" stroke="url(#docs-spine)" strokeWidth="1.4" />
      <path d="M5 7h4" stroke="#dbeafe" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <path d="M5 11h4" stroke="#dbeafe" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <path d="M15 7h4" stroke="#dbeafe" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <path d="M15 11h4" stroke="#dbeafe" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <path d="M2 4.5C2 3.67 2.67 3 3.5 3h5l0 0" stroke="white" strokeWidth="0" />
      <rect x="2" y="3" width="10" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
