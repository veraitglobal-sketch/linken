"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyIntroRecipient } from "@/features/intros/notify";
import { createClient } from "@/lib/supabase/server";

function safeBack(raw: string, fallback: string) {
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

export async function sendIntro(formData: FormData) {
  const recipientId = String(formData.get("recipient_company_id") ?? "").trim();
  const offer = String(formData.get("offer") ?? "").trim();
  const whyRelevant = String(formData.get("why_relevant") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const back = safeBack(
    String(formData.get("back") ?? "").trim(),
    "/dashboard/radar",
  );

  if (!recipientId || offer.length < 5 || whyRelevant.length < 10 || message.length < 20) {
    redirect(
      `${back}?error=${encodeURIComponent("Fill offer, relevance, and a fuller message.")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const { data, error } = await supabase.rpc("send_intro", {
    p_recipient_company_id: recipientId,
    p_offer: offer,
    p_why_relevant: whyRelevant,
    p_message: message,
  });

  if (error || !data?.[0]) {
    redirect(
      `${back}?error=${encodeURIComponent(error?.message ?? "Could not send intro.")}`,
    );
  }

  const row = data[0] as { intro_id: string };
  await notifyIntroRecipient(row.intro_id);

  revalidatePath("/dashboard/radar");
  revalidatePath("/dashboard/inbox");
  redirect(`${back}?introSent=1`);
}

export async function markIntroNotRelevant(formData: FormData) {
  const introId = String(formData.get("intro_id") ?? "").trim();
  if (!introId) redirect("/dashboard/inbox?tab=intros&error=Invalid");

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_intro_not_relevant", {
    p_intro_id: introId,
  });

  if (error) {
    redirect(
      `/dashboard/inbox?tab=intros&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/inbox");
  redirect("/dashboard/inbox?tab=intros");
}

export async function setReceiveIntros(formData: FormData) {
  const enabled = String(formData.get("enabled") ?? "") === "1";
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_receive_intros", {
    p_enabled: enabled,
  });

  if (error) {
    redirect(
      `/dashboard/inbox?tab=intros&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/inbox");
  redirect("/dashboard/inbox?tab=intros");
}
