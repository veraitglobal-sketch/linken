import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { createClient } from "@/lib/supabase/server";
import type { IntroInboxItem, IntroStatus } from "@/types/intro";

function asStatus(value: string): IntroStatus {
  if (
    value === "seen" ||
    value === "replied" ||
    value === "not_relevant"
  ) {
    return value;
  }
  return "sent";
}

/** Intros received by the viewer's company (inbox). */
export async function listReceivedIntros(
  companyId: string,
): Promise<IntroInboxItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intros")
    .select(
      "id, sender_company_id, recipient_company_id, offer, why_relevant, message, status, created_at",
    )
    .eq("recipient_company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("listReceivedIntros:", error?.message);
    return [];
  }

  return Promise.all(
    data.map(async (row) => {
      const senderId = String(row.sender_company_id);
      const { data: sender } = await supabase
        .from("companies")
        .select("id, name, slug, verified")
        .eq("id", senderId)
        .maybeSingle();

      const slug = (sender?.slug as string) ?? "";
      const [trust, assessment, reply] = await Promise.all([
        getTrustProfile(senderId, slug),
        getClientAssessmentSummary(senderId),
        supabase.rpc("get_intro_sender_reply_email", {
          p_intro_id: row.id,
        }),
      ]);

      const would =
        assessment.wouldWorkAgainTotal >= 3
          ? `${assessment.wouldWorkAgainYes} of ${assessment.wouldWorkAgainTotal} would work again`
          : null;

      return {
        id: String(row.id),
        senderCompanyId: senderId,
        recipientCompanyId: String(row.recipient_company_id),
        offer: String(row.offer ?? ""),
        whyRelevant: String(row.why_relevant ?? ""),
        message: String(row.message ?? ""),
        status: asStatus(String(row.status ?? "sent")),
        createdAt: String(row.created_at ?? ""),
        peerName: String(sender?.name ?? "Company"),
        peerSlug: slug,
        peerVerified: Boolean(sender?.verified),
        peerTrustLevel: trust.level,
        wouldWorkAgain: would,
        replyEmail: (reply.data as string | null) ?? null,
      } satisfies IntroInboxItem;
    }),
  );
}
