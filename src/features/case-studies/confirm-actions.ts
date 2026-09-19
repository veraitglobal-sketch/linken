"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterClientConfirmation } from "@/features/case-studies/after-confirm";
import { ensureOwnedCompanyForConfirm } from "@/features/confirm/ensure-company";
import { confirmRpcMessage } from "@/features/confirm/gate";
import { parseConfirmToken } from "@/features/confirm/token";
import {
  disclosureFromConfirmForm,
  levelFromConfirmForm,
} from "@/features/confirmations/meta";
import { withBackQuery } from "@/lib/safe-back";

export async function confirmClientRequest(formData: FormData) {
  await respondClientRequest(formData, "confirmed");
}

export async function declineClientRequest(formData: FormData) {
  await respondClientRequest(formData, "declined");
}

async function respondClientRequest(
  formData: FormData,
  response: "confirmed" | "declined",
) {
  const token = parseConfirmToken(String(formData.get("token") ?? ""));
  if (!token) {
    redirect(
      `/login?error=${encodeURIComponent("This confirmation link is invalid.")}`,
    );
  }
  const path = `/confirm/${token}`;
  const suggested = String(formData.get("suggested_name") ?? "").trim();

  const ensured = await ensureOwnedCompanyForConfirm(suggested);
  if (!ensured.ok) {
    if (ensured.reason === "unauthenticated") {
      redirect(`/login?next=${encodeURIComponent(path)}`);
    }
    redirect(withBackQuery(path, { error: ensured.error }));
  }

  const { supabase, company } = ensured;
  const { error } = await supabase.rpc("respond_client_confirmation", {
    p_token: token,
    p_response: response,
    p_company_id: company.id,
    p_level: levelFromConfirmForm(formData),
    p_disclosure: disclosureFromConfirmForm(formData),
  });

  if (error) {
    console.error("[respond_client_confirmation]", error.message);
    redirect(withBackQuery(path, { error: confirmRpcMessage(error.message) }));
  }

  await afterClientConfirmation({
    supabase: supabase as SupabaseClient,
    token,
    companyId: company.id,
    confirmed: response === "confirmed",
  });

  revalidatePath(path);
  revalidatePath(`/c/${company.slug}`);
  revalidatePath("/welcome");
  redirect(withBackQuery(path, { done: response }));
}
