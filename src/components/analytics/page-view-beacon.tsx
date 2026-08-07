"use client";

import { useEffect, useRef } from "react";
import { trackClientEvent } from "@/features/product-analytics/actions";

type Props = {
  event: "landing_page_viewed" | "pricing_viewed" | "signup_started";
  page: string;
};

/** One-shot client beacon — no provider SDK in the browser. */
export function PageViewBeacon({ event, page }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void trackClientEvent({ name: event, props: { page, surface: "web" } });
  }, [event, page]);

  return null;
}
