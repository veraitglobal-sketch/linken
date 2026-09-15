import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type OauthClient = {
  client_id: string;
  client_name: string;
  redirect_uris: string[];
};

export async function getOauthClient(clientId: string): Promise<OauthClient | null> {
  const admin = createAdminClient();
  if (!admin || !clientId) return null;
  const { data, error } = await admin
    .from("oauth_clients")
    .select("client_id, client_name, redirect_uris")
    .eq("client_id", clientId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    client_id: data.client_id as string,
    client_name: (data.client_name as string) || "MCP client",
    redirect_uris: (data.redirect_uris as string[]) ?? [],
  };
}
