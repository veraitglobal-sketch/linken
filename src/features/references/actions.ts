"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createReferenceCore,
  deleteReferenceCore,
} from "@/features/references/core";
import { sendReferenceConfirmEmail } from "@/lib/email";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { requireOperatorForCompanySlug } from "@/features/workspace/require-operator-slug";
import { setWorkspacePreference } from "@/features/workspace/set-preference";

export async function addReference(formData: FormData) {
  const clientName = String(formData.get("client_name") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const startedYear = String(formData.get("started_year") ?? "").trim();
  const ongoing = String(formData.get("ongoing") ?? "true") === "true";
  const endedYear = String(formData.get("ended_year") ?? "").trim();
  const inviteEmail = String(formData.get("invite_email") ?? "")
    .trim()
    .toLowerCase();
  const website = String(formData.get("website") ?? "").trim();
  const companySlug = String(formData.get("company_slug") ?? "").trim();

  const { supabase, company, back } = await resolveOperatorCompany(
    companySlug,
    companySlug ? `/c/${companySlug}` : "/dashboard",
  );

  const result = await createReferenceCore(supabase, {
    companyId: company.id,
    companyName: company.name,
    clientName,
    service,
    startedYear,
    ongoing,
    endedYear: endedYear || null,
    inviteEmail: inviteEmail || null,
    createGhost: false,
    website: website || null,
  });

  if (!result.ok) {
    redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  }

  const { logActivationEvent } = await import("@/features/activation/events");
  if (inviteEmail) {
    const { assertInviteEmailDailyQuota } = await import(
      "@/features/growth/invite-quota"
    );
    const quota = await assertInviteEmailDailyQuota(supabase, company.id);
    if (!quota.ok) {
      redirect(`${back}?error=${encodeURIComponent(quota.error)}`);
    }
    void logActivationEvent(company.id, "first_invitation_started");
    const sent = await sendReferenceConfirmEmail({
      to: inviteEmail,
      providerName: company.name,
      clientName,
      service,
      startedYear,
      token: result.data.confirmToken,
    });
    if (!sent.ok) {
      redirect(
        `${back}?error=${encodeURIComponent(sent.error ?? "Could not send confirmation email.")}`,
      );
    }
  }

  const { trackReferenceCreatedAnalytics } = await import(
    "@/features/references/track-analytics"
  );
  trackReferenceCreatedAnalytics({
    companyId: company.id,
    createdByCompanyId: company.created_by_company_id,
    inviteSent: Boolean(inviteEmail),
  });

  await setWorkspacePreference("company", company.id);
  revalidatePath(back);
  redirect(`${back}?refAdded=1`);
}

export async function deleteReference(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const companySlug = String(formData.get("company_slug") ?? "").trim();
  const fallback = companySlug ? `/c/${companySlug}` : "/dashboard";

  if (!id) redirect(fallback);

  const { supabase, company, back } = await resolveOperatorCompany(
    companySlug,
    fallback,
  );

  await deleteReferenceCore(supabase, company.id, id);
  await setWorkspacePreference("company", company.id);
  revalidatePath(back);
  redirect(back);
}

async function resolveOperatorCompany(companySlug: string, loginNext: string) {
  if (companySlug) {
    const ctx = await requireOperatorForCompanySlug({
      slug: companySlug,
      loginNext,
    });
    return {
      supabase: ctx.supabase,
      company: ctx.company,
      back: `/c/${ctx.company.slug}`,
    };
  }

  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(loginNext)}`);
  if (!company) {
    redirect(
      `${loginNext}?error=${encodeURIComponent("Switch to a company workspace.")}`,
    );
  }
  return {
    supabase,
    company,
    back: `/c/${company.slug}`,
  };
}
