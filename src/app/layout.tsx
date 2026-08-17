import type { Metadata } from "next";
import { geist, geistMono, inter } from "@/app/fonts";
import { StyleRescue } from "@/components/layout/style-rescue";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

/* Newsreader is not loaded here. Widgets use Geist from this layout; a host
   that wants a different face sets it in the testimonial studio. */

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
 * These rules sit in no cascade layer, so they beat every `@layer` rule
 * Tailwind emits — not just when the stylesheet is missing, but always.
 * Do not set `a { color: … }` here: it permanently overrides `text-white`
 * on navy CTAs (Inbox tabs, Reply by email) and leaves dark text on dark.
 * Color comes from body / utilities once the real stylesheet loads. */
const CRITICAL_CSS = `
html{line-height:1.45;-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink,#0d1210);font-family:var(--font-ui),system-ui,-apple-system,sans-serif}
a{text-decoration:none}
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
      className={`${geist.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
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
