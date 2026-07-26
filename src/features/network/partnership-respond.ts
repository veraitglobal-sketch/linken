"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: mine } = await supabase
    .from("companies")
    .select("id, slug, verified")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!mine) {
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
    .select("id, status, recipient_id")
    .eq("id", partnershipId)
    .maybeSingle();

  if (!row || row.status !== "pending") {
    redirect(`${back}?error=${encodeURIComponent("Request not found or already closed.")}`);
  }
  if (row.recipient_id !== mine.id) {
    redirect(`${back}?error=${encodeURIComponent("Only the recipient can respond.")}`);
  }

  // DB check: rejected | accepted (app UI still says "declined")
  const status = decision === "declined" ? "rejected" : "accepted";
  const { error } = await supabase
    .from("partnerships")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", partnershipId);

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(back);
  revalidatePath(`/c/${mine.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/partners");
  redirect(
    decision === "accepted" ? `${back}?accepted=1` : `${back}?declined=1`,
  );
}
