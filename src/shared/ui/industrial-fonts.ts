import { Inter, JetBrains_Mono } from "next/font/google";

export const industrialSans = Inter({
  variable: "--font-industrial-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const industrialMono = JetBrains_Mono({
  variable: "--font-industrial-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
