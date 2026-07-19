"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createReferenceCore,
  deleteReferenceCore,
} from "@/features/references/core";
import { sendReferenceConfirmEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

async function requireOwnedCompany() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, company: null };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  return { supabase, user, company };
}

export async function addReference(formData: FormData) {
  const clientName = String(formData.get("client_name") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const startedYear = String(formData.get("started_year") ?? "").trim();
  const ongoing = String(formData.get("ongoing") ?? "true") === "true";
  const endedYear = String(formData.get("ended_year") ?? "").trim();
  const inviteEmail = String(formData.get("invite_email") ?? "")
    .trim()
    .toLowerCase();
  const createGhost = String(formData.get("create_ghost") ?? "") === "on";

  const { supabase, user, company } = await requireOwnedCompany();
  const back = company ? `/c/${company.slug}` : "/dashboard";

  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(`${back}?error=${encodeURIComponent("Create your company first.")}`);
  }

  const result = await createReferenceCore(supabase, {
    companyId: company.id,
    companyName: company.name,
    clientName,
    service,
    startedYear,
    ongoing,
    endedYear: endedYear || null,
    inviteEmail: inviteEmail || null,
    createGhost,
  });

  if (!result.ok) {
    redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  }

  if (inviteEmail) {
    await sendReferenceConfirmEmail({
      to: inviteEmail,
      providerName: company.name,
      clientName,
      service,
      startedYear,
      token: result.data.confirmToken,
    });
  }

  revalidatePath(back);
  redirect(`${back}?refAdded=1`);
}

export async function confirmServiceReference(formData: FormData) {
  await respondServiceReference(formData, "confirmed");
}

export async function declineServiceReference(formData: FormData) {
  await respondServiceReference(formData, "declined");
}

async function respondServiceReference(
  formData: FormData,
  decision: "confirmed" | "declined",
) {
  const token = String(formData.get("token") ?? "").trim();
  const path = `/confirm-reference/${token}`;

  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) redirect(path);
  if (!company) {
    redirect(`${path}?error=${encodeURIComponent("Create your company profile first.")}`);
  }

  const { error } = await supabase.rpc("confirm_service_reference", {
    p_token: token,
    p_decision: decision,
    p_company_id: company.id,
  });

  if (error) {
    redirect(`${path}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(path);
  revalidatePath(`/c/${company.slug}`);
  revalidatePath("/welcome");
  if (decision === "confirmed") {
    redirect("/welcome?from=confirm");
  }
  redirect(`${path}?done=${decision}`);
}

export async function deleteReference(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const { supabase, user, company } = await requireOwnedCompany();
  const back = company ? `/c/${company.slug}` : "/dashboard";

  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company || !id) redirect(back);

  await deleteReferenceCore(supabase, company.id, id);

  revalidatePath(back);
  redirect(back);
}
