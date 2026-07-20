"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendPartnershipEndedEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function safeBack(raw: string, fallback = "/dashboard") {
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

/** Notify the other party after end_partnership (service_role email lookup). */
export async function notifyPartnershipEnded(
  partnershipId: string,
  actorCompanyId: string,
) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data } = await admin.rpc("get_partnership_peer_notify_email", {
    p_partnership_id: partnershipId,
    p_actor_company_id: actorCompanyId,
  });
  const row = data?.[0] as
    | { peer_email?: string; peer_name?: string; actor_name?: string }
    | undefined;
  if (!row?.peer_email) return;
  await sendPartnershipEndedEmail({
    to: row.peer_email,
    actorName: String(row.actor_name ?? "A company"),
    peerName: String(row.peer_name ?? "your company"),
  });
}

/** Requester withdraws their own pending request. */
export async function withdrawPartnership(formData: FormData) {
  const partnershipId = String(formData.get("partnership_id") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard/partners"));
  if (!partnershipId) {
    redirect(`${back}?error=${encodeURIComponent("Missing partnership.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { error } = await supabase.rpc("withdraw_partnership", {
    p_partnership_id: partnershipId,
  });
  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateNetwork([back]);
  redirect(`${back}?withdrawn=1`);
}

/** Either party ends an accepted partnership (unilateral). */
export async function endPartnership(formData: FormData) {
  const partnershipId = String(formData.get("partnership_id") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard/partners"));
  if (!partnershipId) {
    redirect(`${back}?error=${encodeURIComponent("Missing partnership.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: mine } = await supabase
    .from("companies")
    .select("id, slug")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!mine) {
    redirect(`${back}?error=${encodeURIComponent("Create your company first.")}`);
  }

  const { error } = await supabase.rpc("end_partnership", {
    p_partnership_id: partnershipId,
  });
  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  await notifyPartnershipEnded(partnershipId, mine.id as string);
  revalidateNetwork([back, `/c/${mine.slug}`]);
  redirect(`${back}?ended=1`);
}
