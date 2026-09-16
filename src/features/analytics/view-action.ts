"use server";

import { headers } from "next/headers";
import { recordVisit } from "@/features/analytics/record-visit";
import { parseProfileSource } from "@/features/analytics/sources";
import { track } from "@/features/product-analytics/track";
import {
  clientIpFromHeaders,
  takeRateLimit,
} from "@/features/security/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Client beacon for a real profile view — prefetch never runs this.
 */
export async function recordProfileViewAction(
  companySlug: string,
  src?: string | null,
): Promise<void> {
  const slug = companySlug.trim().slice(0, 80);
  if (!slug) return;

  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = takeRateLimit({
    key: `profile-view:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limited.ok) return;

  const source = parseProfileSource(src);
  const counted = await recordVisit(
    slug,
    source === "qr" ? "qr_scan" : "profile_view",
    source,
  );
  if (!counted) return;

  const companyId = await companyIdForSlug(slug);
  await track(
    {
      name: "profile_viewed",
      companyId,
      props: { source, surface: source === "embed" ? "embed" : "web" },
    },
    { respectVisitorConsent: true },
  );
}

async function companyIdForSlug(slug: string): Promise<string | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("companies").select("id").eq("slug", slug).maybeSingle();
    return (data?.id as string | undefined) ?? null;
  } catch {
    return null;
  }
}
