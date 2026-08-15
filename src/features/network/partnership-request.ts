"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendPartnershipRequestEmail } from "@/lib/email";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

function revalidateNetwork(paths: string[]) {
  for (const p of paths) {
    revalidatePath(p.split("?")[0]?.split("#")[0] || "/dashboard");
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/partners");
}

/**
 * Invite a claimed company. Re-request after cancelled/rejected UPDATEs the
 * unique-pair row back to pending (no second INSERT).
 */
export async function requestPartnership(formData: FormData) {
  const slug = String(formData.get("company_slug") ?? "")
    .trim()
    .toLowerCase();
  const back = safeAppBack(
    String(formData.get("back") ?? "/dashboard/partners"),
    "/dashboard/partners",
  );

  if (!slug) {
    redirect(withBackQuery(back, { error: "Company slug is required." }));
  }

  const { supabase, user, company: mine } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!mine?.claimed) {
    redirect(withBackQuery(back, { error: "Create your company first." }));
  }
  if (!mine.verified) {
    redirect(
      withBackQuery(back, {
        error: "Verify your domain first, then send partner requests.",
      }),
    );
  }

  const { data: target } = await supabase
    .from("companies")
    .select("id, slug, name, claimed, owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!target || target.claimed === false) {
    redirect(
      withBackQuery(back, {
        error:
          "Company not found or not claimed yet — create a draft invite below.",
      }),
    );
  }
  if (target.id === mine.id) {
    redirect(withBackQuery(back, { error: "Cannot partner with yourself." }));
  }
  if (target.owner_id === user.id) {
    redirect(
      withBackQuery(back, {
        error:
          "That company is already yours. Use Groups for firms you own — not Partners.",
      }),
    );
  }

  const { data: existing } = await supabase
    .from("partnerships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${mine.id},recipient_id.eq.${target.id}),and(requester_id.eq.${target.id},recipient_id.eq.${mine.id})`,
    )
    .maybeSingle();

  if (existing?.status === "accepted") {
    redirect(withBackQuery(back, { error: "Already official partners." }));
  }
  if (existing?.status === "pending") {
    redirect(
      withBackQuery(back, {
        error: "A partnership request is already pending.",
      }),
    );
  }

  let partnershipId = existing?.id as string | undefined;
  if (existing) {
    const { error } = await supabase
      .from("partnerships")
      .update({
        requester_id: mine.id,
        recipient_id: target.id,
        status: "pending",
        responded_at: null,
      })
      .eq("id", existing.id);
    if (error) redirect(withBackQuery(back, { error: error.message }));
  } else {
    const { data: inserted, error } = await supabase
      .from("partnerships")
      .insert({
        requester_id: mine.id,
        recipient_id: target.id,
        status: "pending",
      })
      .select("id")
      .maybeSingle();
    if (error) redirect(withBackQuery(back, { error: error.message }));
    partnershipId = inserted?.id as string | undefined;
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(
      withBackQuery(back, {
        error:
          "Partnership saved locally, but notify email needs SUPABASE_SERVICE_ROLE_KEY.",
      }),
    );
  }
  if (partnershipId) {
    const { emitPartnershipRequested } = await import(
      "@/features/network/emit-partnership-requested"
    );
    await emitPartnershipRequested({
      partnershipId,
      requesterId: mine.id,
      recipientId: target.id as string,
      requesterName: mine.name,
      recipientName: target.name as string,
      recipientSlug: target.slug as string,
    });
  }
  if (target.owner_id) {
    const { data: ownerData } = await admin.auth.admin.getUserById(
      target.owner_id,
    );
    const email = ownerData.user?.email;
    if (email) {
      const sent = await sendPartnershipRequestEmail({
        to: email,
        requesterName: mine.name,
        recipientName: target.name,
      });
      if (!sent.ok) {
        redirect(
          withBackQuery(back, {
            error: sent.error ?? "Request saved, but notify email failed.",
          }),
        );
      }
    }
  }

  revalidateNetwork([back, `/c/${mine.slug}`, `/c/${target.slug}`]);
  redirect(withBackQuery(back, { invited: target.slug }));
}
