import type { NextConfig } from "next";
import path from "path";

if (
  process.env.VERCEL_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL?.trim()
) {
  console.warn(
    "[linken] NEXT_PUBLIC_SITE_URL is not set for production. " +
      "Outbound email/embed links will fall back incorrectly — set it on Vercel before launch.",
  );
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
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
};

export default nextConfig;
