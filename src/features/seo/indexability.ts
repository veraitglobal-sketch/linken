/**
 * Public indexing rules for company surfaces.
 *
 * Every profile is indexable, claimed or not. The loop this serves is
 * discovery: a company searches its own name, finds its profile here, and
 * claims it — and that cannot happen if Google does not know the page exists.
 *
 * Owner's decision, made knowingly. The cost to watch is that a large set of
 * near-empty pages is the textbook "thin content" pattern, and when Google acts
 * on that the penalty lands on the whole domain rather than on those pages. If
 * rankings for claimed profiles ever slip, this is the first thing to look at.
 */

export type Indexability = {
  index: boolean;
  follow: boolean;
};

export function companyIndexability(_input: {
  claimed?: boolean | null;
}): Indexability {
  return { index: true, follow: true };
}

/** Every company belongs in the sitemap now, claimed or not — an indexable page
 *  Google is never told about is, in practice, not indexed. */
export function sitemapIncludesClaimed(_claimed: boolean): boolean {
  return true;
}

/** Pending relationships never appear on public/SEO surfaces. */
export function isPublicRelationshipStatus(
  status: string | null | undefined,
): boolean {
  return status === "confirmed" || status === "accepted";
}
