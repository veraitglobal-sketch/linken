/**
 * Public indexing rules for company surfaces.
 * Unclaimed drafts stay crawlable for claim discovery but must not rank.
 */

export type Indexability = {
  index: boolean;
  follow: boolean;
};

export function companyIndexability(input: {
  claimed?: boolean | null;
}): Indexability {
  if (input.claimed === false) {
    return { index: false, follow: true };
  }
  return { index: true, follow: true };
}

/** Sitemap includes claimed companies only (matches DB filter claimed=true). */
export function sitemapIncludesClaimed(claimed: boolean): boolean {
  return claimed === true;
}

/** Pending relationships never appear on public/SEO surfaces. */
export function isPublicRelationshipStatus(
  status: string | null | undefined,
): boolean {
  return status === "confirmed" || status === "accepted";
}
