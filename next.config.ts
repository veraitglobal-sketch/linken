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
};

export default nextConfig;
