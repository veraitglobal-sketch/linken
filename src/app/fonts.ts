import { Geist, Geist_Mono, Inter } from "next/font/google";

/** Body, headlines, figures — same face Clerk uses for copy and display. */
export const geist = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

/** Micro-labels. Clerk uses Inter here; optical size tracks 11px captions. */
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

/** Code. Clerk ships Söhne Mono (Klim, licensed) — Geist Mono is the open stand-in. */
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
