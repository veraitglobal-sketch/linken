"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  disclosureFromConfirmForm,
  levelFromConfirmForm,
} from "@/features/confirmations/meta";
import { trackReferenceConfirmedAnalytics } from "@/features/references/track-analytics";
import { requireOwnedActiveCompany } from "@/features/workspace/require-owned";

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
      trackReferenceConfirmedAnalytics({
        providerCompanyId: row.provider_company_id,
        confirmerCompanyId: company.id,
      });
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
  redirect(`${path}?done=${decision === "confirmed" ? "confirmed" : decision}`);
}
