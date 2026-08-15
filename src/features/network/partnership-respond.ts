"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

function safeBack(raw: string, fallback = "/dashboard/partners") {
  const back = raw.trim();
  if (
    back.startsWith("/dashboard") ||
    back.startsWith("/c/") ||
    back.startsWith("/partners/requests")
  ) {
    return back;
  }
  return fallback;
}

/** Accept or decline an incoming partnership request. */
export async function respondPartnership(formData: FormData) {
  const partnershipId = String(formData.get("partnership_id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard/partners"));

  if (!partnershipId || !["accepted", "declined"].includes(decision)) {
    redirect(`${back}?error=${encodeURIComponent("Invalid response.")}`);
  }

  const { supabase, user, company: mine } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!mine?.claimed) {
    redirect(`${back}?error=${encodeURIComponent("Create your company first.")}`);
  }
  if (decision === "accepted" && !mine.verified) {
    const verifyBack = back.startsWith("/partners/requests")
      ? "/partners/requests?needVerify=1"
      : `${back}?error=${encodeURIComponent("Verify your domain before accepting partnerships.")}`;
    redirect(verifyBack);
  }

  const { data: row } = await supabase
    .from("partnerships")
    .select("id, status, recipient_id, requester_id")
    .eq("id", partnershipId)
    .maybeSingle();

  if (!row || row.status !== "pending") {
    redirect(`${back}?error=${encodeURIComponent("Request not found or already closed.")}`);
  }
  if (row.recipient_id !== mine.id) {
    redirect(`${back}?error=${encodeURIComponent("Only the recipient can respond.")}`);
  }

  if (decision === "accepted") {
    const { data: requester } = await supabase
      .from("companies")
      .select("owner_id")
      .eq("id", row.requester_id)
      .maybeSingle();
    if (requester?.owner_id === user.id) {
      redirect(
        `${back}?error=${encodeURIComponent(
          "That company is already yours. Use Groups for firms you own — not Partners.",
        )}`,
      );
    }
  }

  const status = decision === "declined" ? "rejected" : "accepted";
  const respondedAt = new Date().toISOString();
  const { error } = await supabase
    .from("partnerships")
    .update({ status, responded_at: respondedAt })
    .eq("id", partnershipId);

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  if (decision === "accepted") {
    const { emitWebhookEvent } = await import("@/features/webhooks/dispatch");
    const { data: firms } = await supabase
      .from("companies")
      .select("id, name, slug")
      .in("id", [row.requester_id as string, row.recipient_id as string]);
    const byId = new Map(
      (firms ?? []).map((f) => [
        f.id as string,
        { name: (f.name as string) ?? "", slug: (f.slug as string) ?? "" },
      ]),
    );
    const requester = byId.get(row.requester_id as string);
    const recipient = byId.get(row.recipient_id as string);
    const base = {
      partnership_id: partnershipId,
      requester_id: row.requester_id,
      recipient_id: row.recipient_id,
      requester_name: requester?.name ?? null,
      recipient_name: recipient?.name ?? null,
      responded_at: respondedAt,
    };
    emitWebhookEvent(
      row.recipient_id as string,
      "partnership.accepted",
      {
        ...base,
        for_company_id: row.recipient_id,
        for_company_name: recipient?.name ?? null,
        for_company_slug: recipient?.slug ?? null,
      },
      `partnership_${partnershipId}`,
    );
    emitWebhookEvent(
      row.requester_id as string,
      "partnership.accepted",
      {
        ...base,
        for_company_id: row.requester_id,
        for_company_name: requester?.name ?? null,
        for_company_slug: requester?.slug ?? null,
      },
      `partnership_${partnershipId}`,
    );

    const {
      offerPartnershipTestimonial,
      testimonialOfferQuery,
    } = await import("@/features/testimonials/partnership-offer");
    const tmUrl = await offerPartnershipTestimonial({
      partnershipId,
      toEmail: user.email,
    });
    revalidatePath(back);
    revalidatePath(`/c/${mine.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/partners");
    redirect(
      `${back}?accepted=1${testimonialOfferQuery(tmUrl)}`,
    );
  }

  revalidatePath(back);
  revalidatePath(`/c/${mine.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/partners");
  redirect(`${back}?declined=1`);
}
