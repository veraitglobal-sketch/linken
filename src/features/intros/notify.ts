import "server-only";

import { sendIntroNotifyEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function notifyIntroRecipient(introId: string) {
  const admin = createAdminClient();
  if (!admin) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY not configured — intro notify skipped.",
    );
    return;
  }

  const { data: email } = await admin.rpc("get_intro_notify_email", {
    p_intro_id: introId,
  });
  if (!email) return;

  const supabase = await createClient();
  const { data: intro } = await supabase
    .from("intros")
    .select("offer, sender_company_id")
    .eq("id", introId)
    .maybeSingle();

  if (!intro) return;

  const { data: sender } = await supabase
    .from("companies")
    .select("name, slug")
    .eq("id", intro.sender_company_id)
    .maybeSingle();

  await sendIntroNotifyEmail({
    to: email as string,
    senderName: String(sender?.name ?? "A company"),
    senderSlug: String(sender?.slug ?? ""),
    offer: String(intro.offer ?? ""),
  });
}
