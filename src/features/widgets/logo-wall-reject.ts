import "server-only";

import { mergeLogoWallOverride } from "@/features/widgets/settings-merge";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { createAdminClient } from "@/lib/supabase/admin";

/** Clear a wall override via one-click reject token from email. */
export async function rejectLogoWallOverrideByToken(input: {
  ownerSlug: string;
  token: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = input.token.trim();
  const ownerSlug = input.ownerSlug.trim();
  if (!token || !ownerSlug) return { ok: false, error: "Missing token." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Service unavailable." };

  const { data: row, error } = await admin
    .from("companies")
    .select("id, widget_settings")
    .eq("slug", ownerSlug)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, error: "This link is invalid or already used." };
  }

  const settings = parseWidgetSettings(row.widget_settings);
  for (const [partnerId, override] of Object.entries(
    settings.logoWall.overrides,
  )) {
    if (override.rejectToken !== token) continue;
    const next = mergeLogoWallOverride(row.widget_settings, partnerId, null);
    const { error: upErr } = await admin
      .from("companies")
      .update({ widget_settings: next })
      .eq("id", row.id);
    if (upErr) return { ok: false, error: upErr.message };
    return { ok: true };
  }

  return { ok: false, error: "This link is invalid or already used." };
}
