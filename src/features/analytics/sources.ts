export const PROFILE_SOURCES = [
  "direct",
  "search",
  "partner",
  "qr",
  "embed",
  "one_pager",
  "external",
] as const;

export type ProfileSource = (typeof PROFILE_SOURCES)[number];

export const PROFILE_EVENT_TYPES = [
  "profile_view",
  "one_pager_view",
  "embed_view",
  "inquiry",
  "qr_scan",
] as const;

export type ProfileEventType = (typeof PROFILE_EVENT_TYPES)[number];

export function parseProfileSource(raw: string | undefined | null): ProfileSource {
  const value = (raw ?? "").trim().toLowerCase();
  if ((PROFILE_SOURCES as readonly string[]).includes(value)) {
    return value as ProfileSource;
  }
  return "direct";
}
