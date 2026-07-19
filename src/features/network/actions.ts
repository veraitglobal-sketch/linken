"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendPartnershipRequestEmail } from "@/lib/email";
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
  revalidatePath("/dashboard/structure");
  revalidatePath("/dashboard/partners");
  revalidatePath("/dashboard/group");
}

/** End an accepted partnership (detach partner edge on the graph). */
export async function endPartnership(formData: FormData) {
  const partnershipId = String(formData.get("partnership_id") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard"));

  if (!partnershipId) {
    redirect(`${back}?error=${encodeURIComponent("Missing partnership.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data: row, error: loadError } = await supabase
    .from("partnerships")
    .select("id, requester_id, recipient_id, status")
    .eq("id", partnershipId)
    .maybeSingle();

  if (loadError || !row) {
    redirect(
      `${back}?error=${encodeURIComponent(loadError?.message ?? "Partnership not found.")}`,
    );
  }

  if (row.status !== "accepted" && row.status !== "pending") {
    redirect(`${back}?error=${encodeURIComponent("Link is already closed.")}`);
  }

  const { error } = await supabase
    .from("partnerships")
    .update({ status: "cancelled", responded_at: new Date().toISOString() })
    .eq("id", partnershipId);

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateNetwork([back]);
  redirect(`${back}?detached=partner`);
}

/**
 * Detach a graph link — partnership or group membership / subsidiary.
 * Client edges are not removed here (evidence stays on references).
 */
export async function detachGraphLink(formData: FormData) {
  const edgeType = String(formData.get("edge_type") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard"));

  if (edgeType === "partner") {
    return endPartnership(formData);
  }

  if (edgeType === "subsidiary" || edgeType === "member_of") {
    const groupId = String(formData.get("group_id") ?? "").trim();
    const companyId = String(formData.get("company_id") ?? "").trim();
    if (!groupId || !companyId) {
      redirect(`${back}?error=${encodeURIComponent("Missing group link.")}`);
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

    const { error } = await supabase.rpc("end_group_membership", {
      p_group_id: groupId,
      p_company_id: companyId,
    });

    if (error) {
      redirect(`${back}?error=${encodeURIComponent(error.message)}`);
    }

    revalidateNetwork([back]);
    redirect(`${back}?detached=structure`);
  }

  redirect(
    `${back}?error=${encodeURIComponent("This link cannot be detached from the graph.")}`,
  );
}

/** Invite an existing claimed company as a pending partner (not on graph until they accept). */
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
    .select("id, status, requester_id, recipient_id")
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
    if (error) {
      redirect(`${back}?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.from("partnerships").insert({
      requester_id: mine.id,
      recipient_id: target.id,
      status: "pending",
    });
    if (error) {
      redirect(`${back}?error=${encodeURIComponent(error.message)}`);
    }
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
    redirect(
      `${back}?error=${encodeURIComponent("Verify your domain before accepting partnerships.")}`,
    );
  }

  const { data: row } = await supabase
    .from("partnerships")
    .select("id, status, requester_id, recipient_id")
    .eq("id", partnershipId)
    .maybeSingle();

  if (!row || row.status !== "pending") {
    redirect(`${back}?error=${encodeURIComponent("Request not found or already closed.")}`);
  }
  if (row.recipient_id !== mine.id) {
    redirect(`${back}?error=${encodeURIComponent("Only the recipient can respond.")}`);
  }

  const { error } = await supabase
    .from("partnerships")
    .update({
      status: decision,
      responded_at: new Date().toISOString(),
    })
    .eq("id", partnershipId);

  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateNetwork([back, `/c/${mine.slug}`, "/dashboard"]);
  redirect(
    decision === "accepted"
      ? `${back}?accepted=1`
      : `${back}?declined=1`,
  );
}
