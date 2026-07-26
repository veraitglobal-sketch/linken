/** Profile href from a logo-wall / widget mark — targets the OTHER company. */
export function embedPartnerHref(input: {
  siteUrl: string;
  partnerSlug: string;
  /** Wall / stamp owner — becomes ?rel= on the partner profile. */
  ownerCompanyId: string;
  viaHost?: string | null;
}): string {
  const q = new URLSearchParams({
    src: "embed",
    rel: input.ownerCompanyId,
  });
  const via = (input.viaHost ?? "").trim().toLowerCase().slice(0, 253);
  if (via) q.set("via", via);
  return `${input.siteUrl}/c/${input.partnerSlug}?${q.toString()}`;
}

export function embedCaseHref(input: {
  siteUrl: string;
  ownerSlug: string;
  caseSlug: string;
  viaHost?: string | null;
}): string {
  const q = new URLSearchParams({ src: "embed" });
  const via = (input.viaHost ?? "").trim().toLowerCase().slice(0, 253);
  if (via) q.set("via", via);
  return `${input.siteUrl}/c/${input.ownerSlug}/case-studies/${input.caseSlug}?${q.toString()}`;
}
