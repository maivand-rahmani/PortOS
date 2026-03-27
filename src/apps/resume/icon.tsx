import type { SVGProps } from "react";

export default function ResumeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="resume-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="resume-lines" x1="7" y1="8" x2="18" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
        <radialGradient id="resume-glow" cx="8" cy="7" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="resume-shadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#2563eb" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect x="3" y="2.5" width="18" height="19" rx="4" fill="url(#resume-bg)" filter="url(#resume-shadow)" />
      <rect x="3" y="2.5" width="18" height="19" rx="4" fill="url(#resume-glow)" />
      <path d="M8 8h8" stroke="url(#resume-lines)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h8" stroke="#dbeafe" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
      <path d="M8 16h5" stroke="#dbeafe" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      <path d="M16 15.5l1.5 1.5 2.5-3" stroke="#eff6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="2.5" width="9.5" height="7" rx="3" fill="white" opacity="0.14" />
    </svg>
  );
}
