"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  disclosureFromConfirmForm,
  levelFromConfirmForm,
} from "@/features/confirmations/meta";
import { ensureOwnedCompanyForConfirm } from "@/features/confirm/ensure-company";
import { confirmRpcMessage } from "@/features/confirm/gate";
import { parseConfirmToken } from "@/features/confirm/token";
import { afterServiceReferenceConfirmed } from "@/features/references/after-confirm";

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
  const token = parseConfirmToken(String(formData.get("token") ?? ""));
  if (!token) {
    redirect(
      `/login?error=${encodeURIComponent("This confirmation link is invalid.")}`,
    );
  }
  const path = `/confirm-reference/${token}`;
  const suggested = String(formData.get("suggested_name") ?? "").trim();

  const ensured = await ensureOwnedCompanyForConfirm(suggested);
  if (!ensured.ok) {
    if (ensured.reason === "unauthenticated") {
      redirect(`/login?next=${encodeURIComponent(path)}`);
    }
    redirect(`${path}?error=${encodeURIComponent(ensured.error)}`);
  }

  const { supabase, company } = ensured;
  const { data: refRow, error } = await supabase.rpc(
    "confirm_service_reference",
    {
      p_token: token,
      p_decision: decision,
      p_company_id: company.id,
      p_level: levelFromConfirmForm(formData),
      p_disclosure: disclosureFromConfirmForm(formData),
    },
  );

  if (error) {
    console.error("[confirm_service_reference]", error.message);
    redirect(`${path}?error=${encodeURIComponent(confirmRpcMessage(error.message))}`);
  }

  if (decision === "confirmed" && refRow) {
    await afterServiceReferenceConfirmed({
      supabase,
      token,
      company: { id: company.id, name: company.name, slug: company.slug },
      refRow,
    });
  } else if (refRow) {
    const { refreshRank } = await import("@/features/ranking/refresh");
    const providerRaw = Array.isArray(refRow) ? refRow[0] : refRow;
    await refreshRank(
      (providerRaw as { provider_company_id?: string } | null)
        ?.provider_company_id,
      company.id,
    );
  }

  revalidatePath(path);
  revalidatePath(`/c/${company.slug}`);
  revalidatePath("/welcome");
  redirect(`${path}?done=${decision === "confirmed" ? "confirmed" : decision}`);
}
