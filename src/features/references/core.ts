import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { assertGhostDailyQuota } from "@/features/partners/ghost-quota";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { sendReferenceConfirmEmail } from "@/lib/email";

export type CoreFail = { ok: false; error: string };
export type CoreOk<T> = { ok: true; data: T };
export type CoreResult<T> = CoreOk<T> | CoreFail;

export type CreateReferenceInput = {
  companyId: string;
  companyName: string;
  clientName: string;
  service: string;
  startedYear: string;
  ongoing: boolean;
  endedYear?: string | null;
  /** Optional — form flow may create ghost + send invite in one step. */
  inviteEmail?: string | null;
  createGhost?: boolean;
  /** Optional website when creating a ghost client profile. */
  website?: string | null;
};

export async function createReferenceCore(
  supabase: SupabaseClient,
  input: CreateReferenceInput,
): Promise<CoreResult<{ id: string; confirmToken: string }>> {
  const clientName = input.clientName.trim();
  const service = input.service.trim();
  const startedYear = input.startedYear.trim();
  const inviteEmail = (input.inviteEmail ?? "").trim().toLowerCase() || null;
  const website = (input.website ?? "").trim();

  if (!clientName || !service || !startedYear) {
    return {
      ok: false,
      error: `Required fields: client_name, service, started_year.`,
    };
  }

  let clientCompanyId: string | null = null;

  if (input.createGhost && inviteEmail) {
    const quota = await assertGhostDailyQuota(supabase, input.companyId);
    if (!quota.ok) return { ok: false, error: quota.error };

    const slug = await uniqueCompanySlug(supabase, clientName);
    const claimToken = crypto.randomUUID();
    const { data: ghost } = await supabase
      .from("companies")
      .insert({
        owner_id: null,
        claimed: false,
        claim_token: claimToken,
        created_by_company_id: input.companyId,
        invite_email: inviteEmail,
        name: clientName,
        slug,
        category: "Client",
        city: "",
        website: website || "",
        tagline: `Client of ${input.companyName}`,
        description: `Draft profile created from a service reference by ${input.companyName}.`,
        services: [],
        verified: false,
      })
      .select("id")
      .single();
    clientCompanyId = ghost?.id ?? null;
    if (website && clientCompanyId) {
      scheduleCompanyLogoFetch(clientCompanyId);
    }
  }

  const confirmToken = crypto.randomUUID();

  const { data: ref, error } = await supabase
    .from("service_references")
    .insert({
      provider_company_id: input.companyId,
      client_company_id: clientCompanyId,
      client_name: clientName,
      service,
      started_year: startedYear,
      ongoing: input.ongoing,
      ended_year: input.ongoing ? null : input.endedYear?.trim() || null,
      status: "pending",
      confirm_token: confirmToken,
      invite_email: inviteEmail,
    })
    .select("id")
    .single();

  if (error || !ref) {
    return {
      ok: false,
      error: error?.message ?? "Could not add reference.",
    };
  }

  return { ok: true, data: { id: ref.id as string, confirmToken } };
}

export type InviteReferenceInput = {
  companyId: string;
  companyName: string;
  referenceId: string;
  email: string;
};

/**
 * Send (or resend) confirmation email for a pending reference owned by companyId.
 * Does not confirm — only invites a human.
 */
export async function inviteReferenceCore(
  supabase: SupabaseClient,
  input: InviteReferenceInput,
): Promise<CoreResult<{ id: string }>> {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "Enter a valid email." };
  }

  const { data: ref, error } = await supabase
    .from("service_references")
    .select(
      "id, client_name, service, started_year, status, confirm_token, provider_company_id",
    )
    .eq("id", input.referenceId)
    .eq("provider_company_id", input.companyId)
    .maybeSingle();

  if (error || !ref) {
    return { ok: false, error: "Reference not found." };
  }
  if (ref.status !== "pending") {
    return {
      ok: false,
      error: "Only pending references can be sent for confirmation.",
    };
  }
  if (!ref.confirm_token) {
    return { ok: false, error: "Reference has no confirm token." };
  }

  const { error: updateError } = await supabase
    .from("service_references")
    .update({ invite_email: email })
    .eq("id", ref.id)
    .eq("provider_company_id", input.companyId)
    .eq("status", "pending");

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const sent = await sendReferenceConfirmEmail({
    to: email,
    providerName: input.companyName,
    clientName: ref.client_name as string,
    service: ref.service as string,
    startedYear: ref.started_year as string,
    token: ref.confirm_token as string,
  });
  if (!sent.ok) {
    return {
      ok: false,
      error: sent.error ?? "Could not send confirmation email.",
    };
  }

  return { ok: true, data: { id: ref.id as string } };
}

export type UpdateReferenceInput = {
  companyId: string;
  referenceId: string;
  clientName?: string;
  service?: string;
  startedYear?: string;
  ongoing?: boolean;
  endedYear?: string | null;
};

export async function updateReferenceCore(
  supabase: SupabaseClient,
  input: UpdateReferenceInput,
): Promise<CoreResult<{ id: string }>> {
  const { data: existing } = await supabase
    .from("service_references")
    .select("id, status")
    .eq("id", input.referenceId)
    .eq("provider_company_id", input.companyId)
    .maybeSingle();

  if (!existing) return { ok: false, error: "Reference not found." };
  if (existing.status !== "pending") {
    return {
      ok: false,
      error: "Only pending references can be edited.",
    };
  }

  const patch: Record<string, unknown> = {};
  if (input.clientName !== undefined) {
    const v = input.clientName.trim();
    if (!v) return { ok: false, error: "client_name cannot be empty." };
    patch.client_name = v;
  }
  if (input.service !== undefined) {
    const v = input.service.trim();
    if (!v) return { ok: false, error: "service cannot be empty." };
    patch.service = v;
  }
  if (input.startedYear !== undefined) {
    const v = input.startedYear.trim();
    if (!v) return { ok: false, error: "started_year cannot be empty." };
    patch.started_year = v;
  }
  if (input.ongoing !== undefined) {
    patch.ongoing = input.ongoing;
    if (input.ongoing) patch.ended_year = null;
  }
  if (input.endedYear !== undefined && input.ongoing !== true) {
    patch.ended_year = input.endedYear?.trim() || null;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No fields to update." };
  }

  const { error } = await supabase
    .from("service_references")
    .update(patch)
    .eq("id", input.referenceId)
    .eq("provider_company_id", input.companyId)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: input.referenceId } };
}

export async function deleteReferenceCore(
  supabase: SupabaseClient,
  companyId: string,
  referenceId: string,
): Promise<CoreResult<{ id: string }>> {
  const { data, error } = await supabase
    .from("service_references")
    .delete()
    .eq("id", referenceId)
    .eq("provider_company_id", companyId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Reference not found." };
  return { ok: true, data: { id: referenceId } };
}
