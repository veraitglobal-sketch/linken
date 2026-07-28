import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const PRIVATE = [
  "/dashboard",
  "/admin",
  "/admin-access-denied",
  "/onboarding",
  "/login",
  "/welcome",
  "/auth/",
  "/api/",
  "/embed/",
  "/dev/",
  "/claim/",
  "/confirm/",
  "/confirm-reference/",
  "/join/",
  "/transfer/",
  "/verify-domain/",
  "/testimonial/",
  "/requests/",
  "/logo-wall/",
];

/** Explicit allow for AI crawlers so llm.md / llms.txt stay discoverable. */
const AI_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
      },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ["/", "/llms.txt", "/c/", "/g/", "/developers"],
        disallow: PRIVATE,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl.replace(/^https?:\/\//, ""),
  };
}
