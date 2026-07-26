"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  getJson,
  initials,
  profileHref,
  HANSALA_ORIGIN,
} from "./lib";

type Partner = { name: string; slug: string; verified: boolean };

/**
 * Client fallback when you cannot use a Server Component.
 * Public API already sends Access-Control-Allow-Origin: * — browser fetch works.
 */
export function PartnerWallClient({ slug }: { slug: string }) {
  const [node, setNode] = useState<ReactNode>(null);

  useEffect(() => {
    const trimmed = slug.trim();
    if (!trimmed) return;
    const via =
      typeof window !== "undefined" ? window.location.hostname : "unknown";
    let cancelled = false;

    void (async () => {
      const data = await getJson<{ partners: Partner[] }>(
        `/api/v1/companies/${encodeURIComponent(trimmed)}/partners`,
      );
      const partners = data?.partners ?? [];
      if (cancelled || partners.length === 0) {
        if (!cancelled) setNode(null);
        return;
      }
      const href = profileHref(trimmed, via);
      setNode(
        <a href={href} target="_blank" rel="noopener noreferrer" className="block no-underline">
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
              Confirmed partners
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {partners.slice(0, 12).map((p) => (
                <li
                  key={p.slug}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900/5 text-[10px] font-semibold text-neutral-700">
                    {initials(p.name)}
                  </span>
                  <span className="max-w-[10rem] truncate text-[12px] font-medium text-neutral-900">
                    {p.name}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-neutral-500">
              Verified on Hansala · {HANSALA_ORIGIN.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </a>,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return node;
}
