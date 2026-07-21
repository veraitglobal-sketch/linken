"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createClient } from "@/lib/supabase/server";

function safeBack(raw: string, fallback = "/dashboard/structure") {
  const back = raw.trim();
  if (
    back.startsWith("/dashboard") ||
    back.startsWith("/search") ||
    back.startsWith("/c/") ||
    back.startsWith("/g/")
  ) {
    return back;
  }
  return fallback;
}

function revalidateNetwork(back: string) {
  revalidatePath(back);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/structure");
}

/** Propose that another confirmed group member also owns a child firm. */
export async function proposeCoOwnership(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const childCompanyId = String(formData.get("child_company_id") ?? "").trim();
  const coParentCompanyId = String(
    formData.get("co_parent_company_id") ?? "",
  ).trim();
  const back = safeBack(String(formData.get("back") ?? ""));

  if (!groupId || !childCompanyId || !coParentCompanyId) {
    redirect(`${back}?error=${encodeURIComponent("Pick both firms.")}`);
  }

  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(
      `${back}?error=${encodeURIComponent("Switch to a company workspace first.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("propose_co_ownership", {
    p_group_id: groupId,
    p_child_company_id: childCompanyId,
    p_co_parent_company_id: coParentCompanyId,
    p_as_company_id: company.id,
  });
  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateNetwork(back);
  redirect(`${back}?coOwnerProposed=1`);
}

async function respondCoOwnership(
  formData: FormData,
  decision: "confirmed" | "declined",
) {
  const edgeId = String(formData.get("edge_id") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? ""));
  if (!edgeId) {
    redirect(`${back}?error=${encodeURIComponent("Missing proposal.")}`);
  }

  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(
      `${back}?error=${encodeURIComponent("Switch to a company workspace first.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_co_ownership", {
    p_edge_id: edgeId,
    p_decision: decision,
    p_as_company_id: company.id,
  });
  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateNetwork(back);
  redirect(`${back}?coOwner${decision === "confirmed" ? "Confirmed" : "Declined"}=1`);
}

export async function confirmCoOwnership(formData: FormData) {
  await respondCoOwnership(formData, "confirmed");
}

export async function declineCoOwnership(formData: FormData) {
  await respondCoOwnership(formData, "declined");
}

/** Either party unilaterally ends a confirmed shared-ownership link. */
export async function endCoOwnership(formData: FormData) {
  const edgeId = String(formData.get("edge_id") ?? "").trim();
  const back = safeBack(String(formData.get("back") ?? ""));
  if (!edgeId) {
    redirect(`${back}?error=${encodeURIComponent("Missing link.")}`);
  }

  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(
      `${back}?error=${encodeURIComponent("Switch to a company workspace first.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("end_co_ownership", {
    p_edge_id: edgeId,
    p_as_company_id: company.id,
  });
  if (error) {
    redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateNetwork(back);
  redirect(`${back}?coOwnerEnded=1`);
}
