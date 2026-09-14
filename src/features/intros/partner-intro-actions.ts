"use server";

import { redirect } from "next/navigation";
import { sendPartnerIntroEmail } from "@/lib/email";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

export async function requestPartnerIntro(formData: FormData) {
  const back = safeAppBack(
    String(formData.get("back") ?? "/dashboard/partners"),
    "/dashboard/partners",
  );
  const partnerId = String(formData.get("partner_id") ?? "").trim();
  const target = String(formData.get("target") ?? "").trim().slice(0, 120);
  const message = String(formData.get("message") ?? "").trim().slice(0, 800);

  const { supabase, user, company: mine } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!mine) {
    redirect(withBackQuery(back, { error: "Switch to a company workspace." }));
  }
  if (!partnerId) {
    redirect(withBackQuery(back, { error: "Choose a partner." }));
  }

  const { data: link } = await supabase
    .from("partnerships")
    .select("id, requester_id, recipient_id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${mine.id},recipient_id.eq.${partnerId}),and(requester_id.eq.${partnerId},recipient_id.eq.${mine.id})`,
    )
    .maybeSingle();
  if (!link) {
    redirect(withBackQuery(back, { error: "Official partners only." }));
  }

  const { data: partner } = await supabase
    .from("companies")
    .select("id, name, owner_id")
    .eq("id", partnerId)
    .maybeSingle();
  if (!partner?.owner_id) {
    redirect(withBackQuery(back, { error: "Could not reach that company." }));
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(withBackQuery(back, { error: "Could not send the request." }));
  }
  const { data: ownerData } = await admin.auth.admin.getUserById(
    partner.owner_id as string,
  );
  const email = ownerData.user?.email;
  if (!email) {
    redirect(withBackQuery(back, { error: "No email on file for that company." }));
  }

  const sent = await sendPartnerIntroEmail({
    to: email,
    fromName: mine.name,
    fromSlug: mine.slug,
    partnerName: partner.name as string,
    target,
    message,
  });
  if (!sent.ok) {
    redirect(
      withBackQuery(back, {
        error: sent.error ?? "Intro request saved, but email failed.",
      }),
    );
  }
  redirect(withBackQuery(back, { introAsked: "1" }));
}
