import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginStage } from "@/components/auth/login-stage";
import { OauthConsentPanel } from "@/components/oauth/oauth-consent-panel";
import { OauthErrorPanel } from "@/components/oauth/oauth-error-panel";
import {
  loginNextForAuthorize,
  oauthRedirect,
  parseAuthorizeQuery,
} from "@/features/oauth/authorize-query";
import { getOauthClient } from "@/features/oauth/clients";
import { listConsentCompanies } from "@/features/oauth/companies";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Allow connector",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function asParams(raw: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  return params;
}

export default async function OauthAuthorizePage({ searchParams }: Props) {
  const raw = await searchParams;
  const params = asParams(raw);
  const issue = typeof raw.issue === "string" ? raw.issue : undefined;
  params.delete("issue");
  const client = await getOauthClient(params.get("client_id") ?? "");
  const parsed = parseAuthorizeQuery(params, client);

  if (!parsed.ok) {
    if (parsed.kind === "redirect" && parsed.redirectUri) {
      redirect(
        oauthRedirect(parsed.redirectUri, {
          error: parsed.error,
          state: parsed.state,
        }),
      );
    }
    return (
      <section className="grid min-h-dvh flex-1 lg:grid-cols-2">
        <LoginStage />
        <OauthErrorPanel
          title="This connection cannot continue"
          body="The app is not registered, or the return address is not one we issued. Close this window and try Connect again from Claude."
        />
      </section>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(loginNextForAuthorize(parsed.query.rawSearch))}`);
  }

  const companies = await listConsentCompanies(user.id);
  return (
    <section className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <LoginStage />
      <OauthConsentPanel
        clientName={client?.client_name ?? "MCP client"}
        companies={companies}
        query={parsed.query}
        issue={issue}
      />
    </section>
  );
}
