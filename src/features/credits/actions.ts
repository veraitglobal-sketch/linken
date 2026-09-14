"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPublisherCreditsCore } from "@/features/credits/core";
import type { CreditTargetRow } from "@/features/credits/types";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";
import { createClient } from "@/lib/supabase/server";

const BACK = "/dashboard/partners";

async function loadTargets(
  publisherId: string,
  partnershipId?: string,
): Promise<CreditTargetRow[] | string> {
  const supabase = await createClient();
  let query = supabase
    .from("partnerships")
    .select(
      `
      id, status, requester_id, recipient_id,
      requester:companies!requester_id(id, slug, website),
      recipient:companies!recipient_id(id, slug, website)
    `,
    )
    .eq("status", "accepted")
    .or(`requester_id.eq.${publisherId},recipient_id.eq.${publisherId}`);

  if (partnershipId) query = query.eq("id", partnershipId);

  const { data, error } = await query;
  if (error) return error.message;
  if (!data?.length) return "Partnership not found.";

  const targets: CreditTargetRow[] = [];
  for (const row of data) {
    const outgoing = row.requester_id === publisherId;
    const otherRaw = outgoing ? row.recipient : row.requester;
    const other = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw;
    if (!other?.id || !other.slug) continue;
    const website = String(other.website ?? "").trim();
    if (!website) continue;
    targets.push({
      partnershipId: row.id as string,
      credited: {
        id: other.id as string,
        slug: other.slug as string,
        website,
      },
    });
  }
  return targets;
}

export async function checkPartnerCredits(formData: FormData) {
  const back = safeAppBack(String(formData.get("back") ?? BACK), BACK);
  const partnershipId = String(formData.get("partnership_id") ?? "").trim();
  const { supabase, user, company } = await getOperatorActiveCompany();

  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(withBackQuery(back, { error: "Create your company first." }));
  }

  const allowed = await supabase.rpc("record_partner_credit_attempt", {
    p_company_id: company.id,
  });
  if (allowed.error) {
    redirect(withBackQuery(back, { error: allowed.error.message }));
  }
  if (allowed.data === false) {
    redirect(
      withBackQuery(back, {
        error: "Rate limit: max 5 site checks per hour. Try again later.",
      }),
    );
  }

  const targets = await loadTargets(company.id, partnershipId || undefined);
  if (typeof targets === "string") {
    redirect(withBackQuery(back, { error: targets }));
  }

  const result = await checkPublisherCreditsCore({
    publisherId: company.id,
    publisherWebsite: company.website ?? "",
    targets,
  });

  revalidatePath("/dashboard/partners");
  revalidatePath("/dashboard/inbox");
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/partners`);

  if (!result.ok) {
    redirect(withBackQuery(back, { error: result.error }));
  }
  if (result.live === 0) {
    redirect(
      withBackQuery(back, {
        error:
          "No partner credit found on your homepage. Paste the snippet, then check again.",
      }),
    );
  }
  redirect(withBackQuery(back, { published: "1" }));
}
