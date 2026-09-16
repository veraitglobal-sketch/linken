"use client";

import { useEffect, useRef } from "react";
import { recordProfileViewAction } from "@/features/analytics/view-action";

/**
 * Counts a profile visit after the page is actually shown.
 *
 * Server renders (and Next prefetch) do not fire this, so a search result
 * sitting in the viewport is not a visit.
 */
export function ProfileViewBeacon({
  slug,
  src,
}: {
  slug: string;
  src?: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void recordProfileViewAction(slug, src);
  }, [slug, src]);

  return null;
}
