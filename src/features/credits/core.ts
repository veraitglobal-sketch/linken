import "server-only";

import { findCreditHrefs } from "@/features/credits/parse";
import { absoluteWebsite } from "@/features/credits/snippet";
import type { CreditCheckResult, CreditTargetRow } from "@/features/credits/types";
import { extractDomain } from "@/features/verification/domain";
import { fetchCompanySite } from "@/features/verification/safe-fetch";
import { createAdminClient } from "@/lib/supabase/admin";

function hrefMatchesSite(href: string, website: string): boolean {
  const found = extractDomain(href);
  const expected = extractDomain(website);
  return Boolean(found && expected && found === expected);
}

async function persistCredit(input: {
  partnershipId: string;
  publisherId: string;
  creditedId: string;
  href: string | null;
}) {
  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Service role required." };

  if (!input.href) {
    const { error } = await admin
      .from("partner_site_credits")
      .delete()
      .eq("partnership_id", input.partnershipId)
      .eq("publisher_id", input.publisherId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  }

  const now = new Date().toISOString();
  const { error } = await admin.from("partner_site_credits").upsert(
    {
      partnership_id: input.partnershipId,
      publisher_id: input.publisherId,
      credited_id: input.creditedId,
      href: input.href,
      detected_at: now,
      last_checked_at: now,
    },
    { onConflict: "partnership_id,publisher_id" },
  );
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function checkPublisherCreditsCore(input: {
  publisherId: string;
  publisherWebsite: string;
  targets: CreditTargetRow[];
}): Promise<CreditCheckResult> {
  const domain = extractDomain(input.publisherWebsite);
  if (!domain) {
    return { ok: false, error: "Add your company website first." };
  }
  if (input.targets.length === 0) {
    return { ok: false, error: "No partners with a website to check." };
  }

  const home = await fetchCompanySite(domain, "/");
  if (!home.ok) return { ok: false, error: home.error };

  const found = findCreditHrefs(home.body);
  let live = 0;
  let missing = 0;

  for (const target of input.targets) {
    const href = found.get(target.credited.slug.toLowerCase()) ?? null;
    const ok = href !== null && hrefMatchesSite(href, target.credited.website);
    const stored = ok && href ? (absoluteWebsite(href) ?? href) : null;
    const saved = await persistCredit({
      partnershipId: target.partnershipId,
      publisherId: input.publisherId,
      creditedId: target.credited.id,
      href: stored,
    });
    if (!saved.ok) return saved;
    if (ok) live += 1;
    else missing += 1;
  }

  return { ok: true, live, missing };
}
