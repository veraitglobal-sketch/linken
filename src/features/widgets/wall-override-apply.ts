import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyPartnerOfLogoOverride } from "@/features/widgets/logo-wall-notify";
import {
  storeWallOverrideFromBytes,
  uploadWallOverrideCore,
} from "@/features/widgets/wall-override-upload";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { getLogoWallConfirmedCandidates } from "@/features/widgets/logo-wall";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

/**
 * Shared path for dashboard + Agent API: store override + email partner.
 * Partner id must be a confirmed wall candidate of ownerCompanyId.
 */
export async function applyPartnerWallLogoOverride(
  admin: SupabaseClient,
  input: {
    ownerCompanyId: string;
    ownerName: string;
    ownerSlug: string;
    partnerCompanyId: string;
    currentSettings: unknown;
    bytes: Uint8Array;
    contentType: string;
  },
): Promise<CoreResult<{ logo_url: string }>> {
  const candidates = await getLogoWallConfirmedCandidates(
    input.ownerCompanyId,
    admin,
  );
  const partner = candidates.find((c) => c.id === input.partnerCompanyId);
  if (!partner) {
    return {
      ok: false,
      error: "Company is not a confirmed partner or client on your wall.",
      status: 403,
    };
  }

  const stored = await uploadWallOverrideCore(admin, {
    ownerCompanyId: input.ownerCompanyId,
    partnerCompanyId: input.partnerCompanyId,
    currentSettings: input.currentSettings,
    bytes: input.bytes,
    contentType: input.contentType,
  });
  if (!stored.ok) return stored;

  const settings = parseWidgetSettings(stored.data.widget_settings);
  const token = settings.logoWall.overrides[input.partnerCompanyId]?.rejectToken;
  if (token) {
    await notifyPartnerOfLogoOverride({
      admin,
      partnerCompanyId: input.partnerCompanyId,
      partnerName: partner.name,
      ownerName: input.ownerName,
      ownerSlug: input.ownerSlug,
      logoUrl: stored.data.logo_url,
      rejectToken: token,
    });
  }

  return { ok: true, data: { logo_url: stored.data.logo_url } };
}

/** Re-fetch candidate → override + notify (same email path). */
export async function applyPartnerWallLogoFromDownload(
  admin: SupabaseClient,
  input: {
    ownerCompanyId: string;
    ownerName: string;
    ownerSlug: string;
    partnerCompanyId: string;
    partnerName: string;
    currentSettings: unknown;
    image: ArrayBuffer;
    ext: string;
    uploadType: string;
  },
): Promise<CoreResult<{ logo_url: string }>> {
  const stored = await storeWallOverrideFromBytes(admin, {
    ownerCompanyId: input.ownerCompanyId,
    partnerCompanyId: input.partnerCompanyId,
    currentSettings: input.currentSettings,
    image: input.image,
    ext: input.ext,
    uploadType: input.uploadType,
  });
  if (!stored.ok) return stored;

  const settings = parseWidgetSettings(stored.data.widget_settings);
  const token = settings.logoWall.overrides[input.partnerCompanyId]?.rejectToken;
  if (token) {
    await notifyPartnerOfLogoOverride({
      admin,
      partnerCompanyId: input.partnerCompanyId,
      partnerName: input.partnerName,
      ownerName: input.ownerName,
      ownerSlug: input.ownerSlug,
      logoUrl: stored.data.logo_url,
      rejectToken: token,
    });
  }

  return { ok: true, data: { logo_url: stored.data.logo_url } };
}
