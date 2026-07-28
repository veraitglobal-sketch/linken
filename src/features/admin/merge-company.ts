import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type MergeMoved = {
  partnerships: number;
  serviceReferencesProvider: number;
  serviceReferencesClient: number;
  caseStudyConfirmRequester: number;
  caseStudyConfirmConfirmed: number;
  testimonialsCompany: number;
  testimonialsAuthor: number;
  slugHistory: number;
  loserSlugRedirected: boolean;
};

export type MergeResult = {
  moved: MergeMoved;
  conflicts: string[];
};

/**
 * Repoints every reference from `loserId` to `winnerId`, then soft-marks the
 * loser. We never hard-delete the loser row: many tables reference
 * companies with `on delete cascade` that this action does not audit
 * (billing, credits, case studies, groups, ...), so a hard delete could
 * silently destroy data with no FK error to catch. Soft-mark is the only
 * safe default here.
 */
export async function mergeCompanies(
  admin: SupabaseClient,
  winnerId: string,
  loserId: string,
  loserSlug: string,
): Promise<MergeResult> {
  const conflicts: string[] = [];

  const { data: partnerships } = await admin
    .from("partnerships")
    .select("id, requester_id, recipient_id")
    .or(`requester_id.eq.${loserId},recipient_id.eq.${loserId}`);

  let partnershipsMoved = 0;
  for (const row of partnerships ?? []) {
    const requester = row.requester_id === loserId ? winnerId : row.requester_id;
    const recipient = row.recipient_id === loserId ? winnerId : row.recipient_id;
    if (requester === recipient) {
      conflicts.push(`partnership ${row.id}: would self-pair on winner, skipped`);
      continue;
    }
    const { error } = await admin
      .from("partnerships")
      .update({ requester_id: requester, recipient_id: recipient })
      .eq("id", row.id);
    if (error) conflicts.push(`partnership ${row.id}: ${error.message}`);
    else partnershipsMoved += 1;
  }

  const [refProvider, refClient, csRequester, csConfirmed, testAuthor] =
    await Promise.all([
      admin
        .from("service_references")
        .update({ provider_company_id: winnerId })
        .eq("provider_company_id", loserId)
        .select("id"),
      admin
        .from("service_references")
        .update({ client_company_id: winnerId })
        .eq("client_company_id", loserId)
        .select("id"),
      admin
        .from("case_study_client_confirmation_requests")
        .update({ requested_by_company_id: winnerId })
        .eq("requested_by_company_id", loserId)
        .select("id"),
      admin
        .from("case_study_client_confirmation_requests")
        .update({ confirmed_by_company_id: winnerId })
        .eq("confirmed_by_company_id", loserId)
        .select("id"),
      admin
        .from("testimonials")
        .update({ author_company_id: winnerId })
        .eq("author_company_id", loserId)
        .select("id"),
    ]);

  const { data: testimonials } = await admin
    .from("testimonials")
    .select("id")
    .eq("company_id", loserId);

  let testimonialsMoved = 0;
  for (const row of testimonials ?? []) {
    const { error } = await admin
      .from("testimonials")
      .update({ company_id: winnerId })
      .eq("id", row.id);
    if (error) conflicts.push(`testimonial ${row.id}: ${error.message}`);
    else testimonialsMoved += 1;
  }

  const { data: slugHistory, error: slugHistoryErr } = await admin
    .from("company_slug_history")
    .update({ company_id: winnerId })
    .eq("company_id", loserId)
    .select("id");
  if (slugHistoryErr) conflicts.push(`slug history: ${slugHistoryErr.message}`);

  let loserSlugRedirected = false;
  if (loserSlug) {
    const { error } = await admin
      .from("company_slug_history")
      .insert({ company_id: winnerId, old_slug: loserSlug });
    if (error) conflicts.push(`loser slug redirect (${loserSlug}): ${error.message}`);
    else loserSlugRedirected = true;
  }

  const mergedSlug = `merged-${loserId.slice(0, 8)}`;
  const { error: markErr } = await admin.rpc("admin_soft_mark_merged_company", {
    p_loser_id: loserId,
    p_winner_id: winnerId,
    p_merged_slug: mergedSlug,
  });
  if (markErr) conflicts.push(`soft-mark loser: ${markErr.message}`);

  return {
    moved: {
      partnerships: partnershipsMoved,
      serviceReferencesProvider: refProvider.data?.length ?? 0,
      serviceReferencesClient: refClient.data?.length ?? 0,
      caseStudyConfirmRequester: csRequester.data?.length ?? 0,
      caseStudyConfirmConfirmed: csConfirmed.data?.length ?? 0,
      testimonialsCompany: testimonialsMoved,
      testimonialsAuthor: testAuthor.data?.length ?? 0,
      slugHistory: slugHistory?.length ?? 0,
      loserSlugRedirected,
    },
    conflicts,
  };
}
