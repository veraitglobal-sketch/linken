"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  endPartnership as endPartnershipImpl,
  withdrawPartnership as withdrawPartnershipImpl,
} from "@/features/network/partnership-lifecycle";
import { requestPartnership as requestPartnershipImpl } from "@/features/network/partnership-request";
import { respondPartnership as respondPartnershipImpl } from "@/features/network/partnership-respond";
import { createClient } from "@/lib/supabase/server";

export async function requestPartnership(formData: FormData) {
  return requestPartnershipImpl(formData);
}

export async function respondPartnership(formData: FormData) {
  return respondPartnershipImpl(formData);
}

export async function endPartnership(formData: FormData) {
  return endPartnershipImpl(formData);
}

export async function withdrawPartnership(formData: FormData) {
  return withdrawPartnershipImpl(formData);
}

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

/**
 * Detach a graph link — partnership or group membership / subsidiary.
 * Client edges are not removed here (evidence stays on references).
 */
export async function detachGraphLink(formData: FormData) {
  const edgeType = String(formData.get("edge_type") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? "/dashboard"));

  if (edgeType === "partner") {
    return endPartnershipImpl(formData);
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

    revalidatePath(back);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/structure");
    redirect(`${back}?detached=structure`);
  }

  redirect(
    `${back}?error=${encodeURIComponent("This link cannot be detached from the graph.")}`,
  );
}
