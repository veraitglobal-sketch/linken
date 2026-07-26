"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  detectSchedulingProvider,
  normalizeSchedulingUrl,
} from "@/features/scheduling/types";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";

export async function saveSchedulingLink(formData: FormData) {
  const back = "/dashboard/integrations";
  const rawUrl = String(formData.get("scheduling_url") ?? "");
  const label =
    String(formData.get("scheduling_label") ?? "").trim() || "Book a call";

  const url = normalizeSchedulingUrl(rawUrl);
  if (!url) {
    redirect(
      `${back}?error=${encodeURIComponent(
        "Use a Calendly or Cal.com booking link (https://calendly.com/… or https://cal.com/…).",
      )}`,
    );
  }

  const provider = detectSchedulingProvider(url);
  if (!provider) {
    redirect(
      `${back}?error=${encodeURIComponent("Only Calendly and Cal.com are supported.")}`,
    );
  }

  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: back,
  });

  const { error } = await supabase
    .from("companies")
    .update({
      scheduling_provider: provider,
      scheduling_url: url,
      scheduling_label: label.slice(0, 40),
    })
    .eq("id", company.id);

  if (error) {
    redirect(
      `${back}?error=${encodeURIComponent(error.message ?? "Could not save.")}`,
    );
  }

  const { emitWebhookEvent } = await import("@/features/webhooks/dispatch");
  emitWebhookEvent(
    company.id,
    "booking.connected",
    {
      provider,
      url,
      label: label.slice(0, 40),
    },
    `booking_${company.id}_${provider}`,
  );

  revalidatePath(back);
  revalidatePath(`/c/${company.slug}`);
  redirect(`${back}?saved=1`);
}

export async function disconnectScheduling() {
  const back = "/dashboard/integrations";
  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: back,
  });

  const { error } = await supabase
    .from("companies")
    .update({
      scheduling_provider: null,
      scheduling_url: null,
      scheduling_label: "Book a call",
    })
    .eq("id", company.id);

  if (error) {
    redirect(
      `${back}?error=${encodeURIComponent(error.message ?? "Could not disconnect.")}`,
    );
  }

  revalidatePath(back);
  revalidatePath(`/c/${company.slug}`);
  redirect(`${back}?disconnected=1`);
}
