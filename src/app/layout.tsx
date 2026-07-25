import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
