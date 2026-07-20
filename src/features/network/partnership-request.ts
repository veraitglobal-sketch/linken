"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendPartnershipRequestEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function safeBack(raw: string, fallback = "/dashboard/partners") {
  const back = raw.trim();
  if (
    back.startsWith("/dashboard") ||
    back.startsWith("/search") ||
    back.startsWith("/c/")
  ) {
    return back;
  }
  return fallback;
}

function revalidateNetwork(paths: string[]) {
  for (const p of paths) revalidatePath(p);
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
  const back = safeBack(String(formData.get("back") ?? "/dashboard/partners"));

  if (!slug) {
    redirect(`${back}?error=${encodeURIComponent("Company slug is required.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: mine } = await supabase
    .from("companies")
    .select("id, slug, name, verified")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!mine) {
    redirect(`${back}?error=${encodeURIComponent("Create your company first.")}`);
  }
  if (!mine.verified) {
    redirect(
      `${back}?error=${encodeURIComponent("Verify your domain first, then send partner requests.")}`,
    );
  }

  const { data: target } = await supabase
    .from("companies")
    .select("id, slug, name, claimed, owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!target || target.claimed === false) {
    redirect(
      `${back}?error=${encodeURIComponent("Company not found or not claimed yet — create a draft invite below.")}`,
    );
  }
  if (target.id === mine.id) {
    redirect(`${back}?error=${encodeURIComponent("Cannot partner with yourself.")}`);
  }

  const { data: existing } = await supabase
    .from("partnerships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${mine.id},recipient_id.eq.${target.id}),and(requester_id.eq.${target.id},recipient_id.eq.${mine.id})`,
    )
    .maybeSingle();

  if (existing?.status === "accepted") {
    redirect(`${back}?error=${encodeURIComponent("Already official partners.")}`);
  }
  if (existing?.status === "pending") {
    redirect(
      `${back}?error=${encodeURIComponent("A partnership request is already pending.")}`,
    );
  }

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
    if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await supabase.from("partnerships").insert({
      requester_id: mine.id,
      recipient_id: target.id,
      status: "pending",
    });
    if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  const admin = createAdminClient();
  if (admin && target.owner_id) {
    const { data: ownerData } = await admin.auth.admin.getUserById(
      target.owner_id,
    );
    const email = ownerData.user?.email;
    if (email) {
      await sendPartnershipRequestEmail({
        to: email,
        requesterName: mine.name,
        recipientName: target.name,
      });
    }
  }

  revalidateNetwork([back, `/c/${mine.slug}`, `/c/${target.slug}`]);
  redirect(`${back}?invited=${encodeURIComponent(target.slug)}`);
}
