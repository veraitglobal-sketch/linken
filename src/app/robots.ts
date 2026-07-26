import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/api/v1/openapi",
          "/api/v1/openapi/public",
          "/api/v1/openapi/agent",
          "/api/health",
          "/.well-known/security.txt",
        ],
        disallow: ["/dashboard", "/onboarding", "/login", "/auth/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
