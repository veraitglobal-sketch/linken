import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  detectSchedulingProvider,
  emptyScheduling,
  normalizeSchedulingUrl,
  type CompanyScheduling,
  type SchedulingProvider,
} from "@/features/scheduling/types";
import { getSiteUrl } from "@/lib/site";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type AgentScheduling = CompanyScheduling & {
  connected: boolean;
  /** Human OAuth connect (browser). Agents should PUT a public booking URL. */
  oauth_dashboard_url: string;
};

function mapRow(row: {
  scheduling_provider?: string | null;
  scheduling_url?: string | null;
  scheduling_label?: string | null;
}): CompanyScheduling {
  const provider =
    row.scheduling_provider === "calendly" ||
    row.scheduling_provider === "calcom"
      ? row.scheduling_provider
      : null;
  const url = (row.scheduling_url ?? "").trim() || null;
  if (!provider || !url) return emptyScheduling();
  return {
    provider,
    url,
    label: (row.scheduling_label ?? "").trim() || "Book a call",
  };
}

export async function getSchedulingAgentCore(
  admin: SupabaseClient,
  companyId: string,
): Promise<CoreResult<AgentScheduling>> {
  const { data, error } = await admin
    .from("companies")
    .select("scheduling_provider, scheduling_url, scheduling_label")
    .eq("id", companyId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Company not found." };
  }

  const base = mapRow(data);
  return {
    ok: true,
    data: {
      ...base,
      connected: Boolean(base.provider && base.url),
      oauth_dashboard_url: `${getSiteUrl()}/dashboard/integrations`,
    },
  };
}

export async function setSchedulingAgentCore(
  admin: SupabaseClient,
  companyId: string,
  input: {
    url?: unknown;
    label?: unknown;
    provider?: unknown;
  },
): Promise<CoreResult<AgentScheduling>> {
  const rawUrl = typeof input.url === "string" ? input.url : "";
  const url = normalizeSchedulingUrl(rawUrl);
  if (!url) {
    return {
      ok: false,
      error:
        "url must be a Calendly or Cal.com booking link (https://calendly.com/… or https://cal.com/…).",
    };
  }

  let provider: SchedulingProvider | null = detectSchedulingProvider(url);
  if (
    typeof input.provider === "string" &&
    (input.provider === "calendly" || input.provider === "calcom")
  ) {
    if (provider && provider !== input.provider) {
      return {
        ok: false,
        error: `URL looks like ${provider}, but provider was set to ${input.provider}.`,
      };
    }
    provider = input.provider;
  }
  if (!provider) {
    return { ok: false, error: "Could not detect provider from URL." };
  }

  const label =
    typeof input.label === "string" && input.label.trim()
      ? input.label.trim().slice(0, 40)
      : "Book a call";

  const { error } = await admin
    .from("companies")
    .update({
      scheduling_provider: provider,
      scheduling_url: url,
      scheduling_label: label,
    })
    .eq("id", companyId);

  if (error) return { ok: false, error: error.message };
  return getSchedulingAgentCore(admin, companyId);
}

export async function clearSchedulingAgentCore(
  admin: SupabaseClient,
  companyId: string,
): Promise<CoreResult<AgentScheduling>> {
  const { error } = await admin
    .from("companies")
    .update({
      scheduling_provider: null,
      scheduling_url: null,
      scheduling_label: "Book a call",
    })
    .eq("id", companyId);

  if (error) return { ok: false, error: error.message };
  return getSchedulingAgentCore(admin, companyId);
}
