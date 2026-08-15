import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CompanySlackPublic = {
  teamName: string;
  channelName: string;
  connectedAt: string;
};

/** Owner-visible connection status — never includes webhook_url. */
export async function getCompanySlackStatus(
  companyId: string,
): Promise<CompanySlackPublic | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_slack")
    .select("team_name, channel_name, connected_at")
    .eq("company_id", companyId)
    .maybeSingle();

  if (!data) return null;
  return {
    teamName: (data.team_name as string) || "Slack",
    channelName: (data.channel_name as string) || "",
    connectedAt: data.connected_at as string,
  };
}

export async function upsertCompanySlack(input: {
  companyId: string;
  userId: string;
  teamId: string;
  teamName: string;
  channelId: string;
  channelName: string;
  webhookUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Service unavailable." };

  const { error } = await admin.from("company_slack").upsert(
    {
      company_id: input.companyId,
      team_id: input.teamId,
      team_name: input.teamName,
      channel_id: input.channelId,
      channel_name: input.channelName,
      webhook_url: input.webhookUrl,
      connected_by: input.userId,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "company_id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteCompanySlack(
  companyId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Service unavailable." };
  const { error } = await admin
    .from("company_slack")
    .delete()
    .eq("company_id", companyId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
