import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  exchangeCalcomCode,
  fetchCalcomSchedulingUrl,
} from "@/features/scheduling/calcom-oauth";
import { verifySchedulingState } from "@/features/scheduling/oauth-state";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

function back(query: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/integrations?${query}`, getSiteUrl()),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return back(
      `error=${encodeURIComponent("Cal.com connection was cancelled.")}`,
    );
  }
  if (!code || !state) {
    return back(`error=${encodeURIComponent("Missing Cal.com authorization.")}`);
  }

  const parsed = verifySchedulingState(state);
  if (!parsed) {
    return back(
      `error=${encodeURIComponent("Cal.com session expired. Try again.")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== parsed.userId) {
    return back(
      `error=${encodeURIComponent("Sign in again to connect Cal.com.")}`,
    );
  }

  const token = await exchangeCalcomCode(code);
  if ("error" in token) {
    return back(`error=${encodeURIComponent(token.error)}`);
  }

  const schedulingUrl = await fetchCalcomSchedulingUrl(token.accessToken);
  if (!schedulingUrl) {
    return back(
      `error=${encodeURIComponent(
        "Connected, but no Cal.com event was found. Paste your booking link below.",
      )}`,
    );
  }

  const { data: company, error } = await supabase
    .from("companies")
    .update({
      scheduling_provider: "calcom",
      scheduling_url: schedulingUrl,
      scheduling_label: "Book a call",
    })
    .eq("id", parsed.companyId)
    .select("slug")
    .maybeSingle();

  if (error) {
    return back(`error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/integrations");
  if (company?.slug) revalidatePath(`/c/${company.slug}`);
  return back("connected=calcom");
}
