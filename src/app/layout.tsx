import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "PortOS",
  description: "A browser-based portfolio operating system built with Next.js.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans text-foreground">{children}</body>
    </html>
  );
}
