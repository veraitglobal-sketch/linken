import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildEmbedSnippet,
  buildEmbedSrc,
  WIDGET_CATALOG,
  type WidgetTheme,
  type WidgetVariant,
} from "@/features/widgets/catalog";
import { parseWidgetSettings, type WidgetSettings } from "@/features/widgets/settings";
import { applyWidgetSettingsBody } from "@/features/widgets/widget-settings-patch";
import { getSiteUrl } from "@/lib/site";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getWidgetSettingsCore(
  admin: SupabaseClient,
  companyId: string,
): Promise<
  CoreResult<{
    widget_settings: WidgetSettings;
    allow_logo_in_partner_widgets: boolean;
    accepting_clients: boolean;
  }>
> {
  const { data, error } = await admin
    .from("companies")
    .select("widget_settings, allow_logo_in_partner_widgets, accepting_clients")
    .eq("id", companyId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Company not found." };
  }

  return {
    ok: true,
    data: {
      widget_settings: parseWidgetSettings(data.widget_settings),
      allow_logo_in_partner_widgets:
        data.allow_logo_in_partner_widgets !== false,
      accepting_clients: data.accepting_clients !== false,
    },
  };
}

export async function updateWidgetSettingsCore(
  admin: SupabaseClient,
  companyId: string,
  body: Record<string, unknown>,
): Promise<CoreResult<{ updated: string[] }>> {
  const allowed = new Set([
    "widget_settings",
    "allow_logo_in_partner_widgets",
    "accepting_clients",
    "excluded_company_ids",
    "logo_wall",
  ]);
  const rejected = Object.keys(body).filter((k) => !allowed.has(k));
  if (rejected.length) {
    return {
      ok: false,
      error: `Field(s) not allowed: ${rejected.join(", ")}.`,
    };
  }

  const { data: current } = await admin
    .from("companies")
    .select("widget_settings")
    .eq("id", companyId)
    .maybeSingle();

  const applied = applyWidgetSettingsBody(current?.widget_settings, body);
  if (!applied.ok) return applied;

  const patch: Record<string, unknown> = {};
  const updated: string[] = [];

  if (applied.touched) {
    patch.widget_settings = applied.widgetSettings;
    updated.push("widget_settings");
  }

  if ("allow_logo_in_partner_widgets" in body) {
    if (typeof body.allow_logo_in_partner_widgets !== "boolean") {
      return {
        ok: false,
        error: "allow_logo_in_partner_widgets must be a boolean.",
      };
    }
    patch.allow_logo_in_partner_widgets = body.allow_logo_in_partner_widgets;
    updated.push("allow_logo_in_partner_widgets");
  }

  if ("accepting_clients" in body) {
    if (typeof body.accepting_clients !== "boolean") {
      return { ok: false, error: "accepting_clients must be a boolean." };
    }
    patch.accepting_clients = body.accepting_clients;
    updated.push("accepting_clients");
  }

  if (!updated.length) {
    return { ok: false, error: "No fields to update." };
  }

  const { error } = await admin
    .from("companies")
    .update(patch)
    .eq("id", companyId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { updated } };
}

export function listWidgetVariantsCore(slug: string) {
  const siteUrl = getSiteUrl();
  const theme: WidgetTheme = "light";
  return WIDGET_CATALOG.map((w) => {
    const variant = w.id as WidgetVariant;
    return {
      id: w.id,
      name: w.name,
      description: w.description,
      height: w.height,
      pro: Boolean(w.pro),
      embed_url: buildEmbedSrc({ siteUrl, slug, variant, theme }),
      snippet: buildEmbedSnippet({
        siteUrl,
        slug,
        variant,
        theme,
        width: "100%",
      }),
    };
  });
}
