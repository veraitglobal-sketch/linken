import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
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
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl.replace(/^https?:\/\//, ""),
  };
}
