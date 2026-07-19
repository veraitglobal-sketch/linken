"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertGhostDailyQuota } from "@/features/partners/ghost-quota";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
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
  if (!clientName || !service || !startedYear) {
    redirect(
      `${back}?error=${encodeURIComponent("Client, service, and start year are required.")}`,
    );
  }

  let clientCompanyId: string | null = null;

  if (createGhost && inviteEmail) {
    const quota = await assertGhostDailyQuota(supabase, company.id);
    if (!quota.ok) {
      redirect(`${back}?error=${encodeURIComponent(quota.error)}`);
    }

    const slug = await uniqueCompanySlug(supabase, clientName);
    const claimToken = crypto.randomUUID();
    const { data: ghost } = await supabase
      .from("companies")
      .insert({
        owner_id: null,
        claimed: false,
        claim_token: claimToken,
        created_by_company_id: company.id,
        invite_email: inviteEmail,
        name: clientName,
        slug,
        category: "Client",
        city: "",
        tagline: `Client of ${company.name}`,
        description: `Draft profile created from a service reference by ${company.name}.`,
        services: [],
        verified: false,
      })
      .select("id")
      .single();
    clientCompanyId = ghost?.id ?? null;
  }

  const confirmToken = crypto.randomUUID();

  const { data: ref, error } = await supabase
    .from("service_references")
    .insert({
      provider_company_id: company.id,
      client_company_id: clientCompanyId,
      client_name: clientName,
      service,
      started_year: startedYear,
      ongoing,
      ended_year: ongoing ? null : endedYear || null,
      status: "pending",
      confirm_token: confirmToken,
      invite_email: inviteEmail || null,
    })
    .select("id")
    .single();

  if (error || !ref) {
    redirect(
      `${back}?error=${encodeURIComponent(error?.message ?? "Could not add reference.")}`,
    );
  }

  if (inviteEmail) {
    await sendReferenceConfirmEmail({
      to: inviteEmail,
      providerName: company.name,
      clientName,
      service,
      startedYear,
      token: confirmToken,
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
  redirect(`${path}?done=${decision}`);
}

export async function deleteReference(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const { supabase, user, company } = await requireOwnedCompany();
  const back = company ? `/c/${company.slug}` : "/dashboard";

  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company || !id) redirect(back);

  await supabase
    .from("service_references")
    .delete()
    .eq("id", id)
    .eq("provider_company_id", company.id);

  revalidatePath(back);
  redirect(back);
}
