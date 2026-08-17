import type { NextConfig } from "next";
import path from "path";

if (
  process.env.VERCEL_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL?.trim()
) {
  console.warn(
    "[hansala] NEXT_PUBLIC_SITE_URL is not set for production. " +
      "Outbound links will use https://hansala.com — set NEXT_PUBLIC_SITE_URL on Vercel to match your domain.",
  );
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    optimizePackageImports: ["recharts", "@xyflow/react"],
    serverActions: {
      // Cover/gallery uploads via FormData — default 1MB causes opaque 500 errors.
      bodySizeLimit: "10mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      {
        key: "Content-Security-Policy-Report-Only",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://*.supabase.co",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    ];
    return [
      {
        source: "/:path*",
        headers: security,
      },
      {
        source: "/images/:path*",
        headers: [
          {
            /* Not `immutable`.
               `immutable` promises the browser this URL's bytes will never
               change, so it stops revalidating entirely — for the year the
               max-age allows. That is correct for content-hashed filenames like
               `/_next/static/…`, and wrong here, where `slack.svg` keeps its
               name when its contents are fixed. A broken logo was cached that
               way and no reload could dislodge it; the fix was invisible to
               anyone who had already loaded the page.
               An hour fresh, a day of serving the old copy while fetching the
               new one in the background: still effectively free, and a
               correction reaches people the same day instead of next year. */
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/logos/:path*",
        headers: [
          {
            /* Not `immutable`.
               `immutable` promises the browser this URL's bytes will never
               change, so it stops revalidating entirely — for the year the
               max-age allows. That is correct for content-hashed filenames like
               `/_next/static/…`, and wrong here, where `slack.svg` keeps its
               name when its contents are fixed. A broken logo was cached that
               way and no reload could dislodge it; the fix was invisible to
               anyone who had already loaded the page.
               An hour fresh, a day of serving the old copy while fetching the
               new one in the background: still effectively free, and a
               correction reaches people the same day instead of next year. */
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async rewrites() {
    // `/sitemap.xml` was swallowed by `(site)/[slug]` → company 404.
    return [{ source: "/sitemap.xml", destination: "/api/sitemap-index" }];
  },
};

export default nextConfig;
