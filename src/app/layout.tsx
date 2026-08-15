import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { StyleRescue } from "@/components/layout/style-rescue";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Newsreader is not loaded here on purpose. It is a widget-theme face, and
   the embed fetches it itself via `googleFontStylesheet` — carrying it in the
   app bundle downloaded a font no Hansala page ever rendered. */

const title = "Hansala — Mutually Confirmed Project Networks";
const description =
  "One company link for your profile, case studies, and mutually verified partners — visible only after both sides confirm.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: title,
    template: "%s · Hansala",
  },
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Hansala",
    type: "website",
    images: ["/images/highlight-share.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/highlight-share.jpg"],
  },
};

/** Organization + WebSite graph. No SearchAction — the directory is not public yet. */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${getSiteUrl()}/#organization`,
      name: "Hansala",
      url: getSiteUrl(),
      description,
    },
    {
      "@type": "WebSite",
      "@id": `${getSiteUrl()}/#website`,
      name: "Hansala",
      url: getSiteUrl(),
      description,
      publisher: { "@id": `${getSiteUrl()}/#organization` },
      inLanguage: "en",
    },
  ],
};

/** Baseline if external CSS fails (email WebViews / stale Safari caches).
 *
 * These rules sit in no cascade layer, so they beat every `@layer base` rule
 * Tailwind emits — not just when the stylesheet is missing, but always. The
 * font therefore has to name the same variable the real rule does, or this
 * safety net silently holds the whole site on the system face. */
const CRITICAL_CSS = `
html{line-height:1.45;-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink,#0d1210);font-family:var(--font-ui),system-ui,-apple-system,sans-serif}
a{color:inherit;text-decoration:none}
img{max-width:100%;height:auto}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
        <StyleRescue />
      </body>
    </html>
  );
}
