import { NextResponse, type NextRequest } from "next/server";
import { buildEmbedFrameAncestors } from "@/features/widgets/frame-ancestors";
import { extractDomain } from "@/features/verification/domain";

type WebsiteCache = { website: string | null; at: number };
const websiteCache = new Map<string, WebsiteCache>();
const CACHE_MS = 60_000;

/**
 * Set per-company Content-Security-Policy: frame-ancestors on embed responses.
 * Dynamic CSP belongs in Proxy — next.config headers are static
 * (see next/dist/docs/01-app/02-guides/content-security-policy.md).
 */
export async function withEmbedFrameAncestors(request: NextRequest) {
  const response = NextResponse.next({ request });
  const slug = embedSlug(request.nextUrl.pathname);
  const website = slug ? await fetchVerifiedWebsite(slug) : null;
  response.headers.set(
    "Content-Security-Policy",
    buildEmbedFrameAncestors(website),
  );
  response.headers.delete("X-Frame-Options");
  return response;
}

function embedSlug(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "embed" || !parts[1]) return null;
  return decodeURIComponent(parts[1]);
}

/** Website only counts for frame-ancestors once the domain is verified. */
async function fetchVerifiedWebsite(slug: string): Promise<string | null> {
  const cached = websiteCache.get(slug);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.website;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) return null;

  let website: string | null = null;
  try {
    const endpoint = new URL(`${url}/rest/v1/companies`);
    endpoint.searchParams.set("select", "website,verified");
    endpoint.searchParams.set("slug", `eq.${slug}`);
    endpoint.searchParams.set("limit", "1");

    const res = await fetch(endpoint.toString(), {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: "application/json",
      },
    });
    if (res.ok) {
      const rows = (await res.json()) as {
        website?: string | null;
        verified?: boolean;
      }[];
      const row = rows[0];
      const raw = row?.website?.trim() || null;
      if (row?.verified && raw && extractDomain(raw)) website = raw;
    }
  } catch {
    website = null;
  }

  websiteCache.set(slug, { website, at: Date.now() });
  return website;
}
