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
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/logos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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
