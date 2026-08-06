"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createReferenceCore,
  deleteReferenceCore,
} from "@/features/references/core";
import {
  disclosureFromConfirmForm,
  levelFromConfirmForm,
} from "@/features/confirmations/meta";
import { sendReferenceConfirmEmail } from "@/lib/email";
import { requireOwnedActiveCompany } from "@/features/workspace/require-owned";
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
    // Ghosts must not become workspaces — confirm email only.
    createGhost: false,
    website: website || null,
  });

  if (!result.ok) {
    redirect(`${back}?error=${encodeURIComponent(result.error)}`);
  }

  const { logActivationEvent } = await import("@/features/activation/events");
  void logActivationEvent(company.id, "first_project_created");
  if (inviteEmail) {
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
    void logActivationEvent(company.id, "first_invitation_sent");
  }

  await setWorkspacePreference("company", company.id);
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

  const { supabase, company } = await requireOwnedActiveCompany({
    loginNext: path,
  });

  const { data: refRow, error } = await supabase.rpc(
    "confirm_service_reference",
    {
      p_token: token,
      p_decision: decision,
      p_company_id: company.id,
      ...(decision === "confirmed"
        ? {
            p_level: levelFromConfirmForm(formData),
            p_disclosure: disclosureFromConfirmForm(formData),
          }
        : {}),
    },
  );

  if (error) {
    const raw = error.message ?? "Could not respond.";
    const message = /already resolved|not found/i.test(raw)
      ? "This request can’t be confirmed with the company you’re signed in as. Sign in as the client company, or ask them to open this link."
      : /Not company owner/i.test(raw)
        ? "Only the company owner can confirm this request."
        : raw;
    redirect(`${path}?error=${encodeURIComponent(message)}`);
  }

  if (decision === "confirmed" && refRow) {
    const raw = Array.isArray(refRow) ? refRow[0] : refRow;
    const row = raw as {
      id?: string;
      provider_company_id?: string;
      client_name?: string;
      service?: string;
    } | null;
    if (row?.provider_company_id && row.id) {
      const { logActivationEvent } = await import(
        "@/features/activation/events"
      );
      void logActivationEvent(
        row.provider_company_id,
        "first_reference_confirmed",
      );
      const { emitWebhookEvent } = await import("@/features/webhooks/dispatch");
      emitWebhookEvent(
        row.provider_company_id,
        "reference.confirmed",
        {
          reference_id: row.id,
          client_name: row.client_name ?? null,
          service: row.service ?? null,
          confirmed_by_company_id: company.id,
        },
        `reference_${row.id}`,
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      const { offerTestimonialAfterConfirm } = await import(
        "@/features/testimonials/post-confirm-notify"
      );
      await offerTestimonialAfterConfirm({
        token,
        source: "reference",
        toEmail: user.email,
      });
    }
  }

  revalidatePath(path);
  revalidatePath(`/c/${company.slug}`);
  revalidatePath("/welcome");
  if (decision === "confirmed") {
    redirect(`${path}?done=confirmed`);
  }
  redirect(`${path}?done=${decision}`);
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

/** Prefer slug from the wall form; fall back to active workspace. */
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
