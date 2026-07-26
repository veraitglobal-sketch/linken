"use client";

import { useMemo, useState } from "react";
import { PartnerCard } from "@/components/partners/partner-card";
import { savePartnerRail } from "@/features/partners/rail-actions";
import {
  PARTNER_RAIL_LIMIT_OPTIONS,
  type PartnerRailSettings,
} from "@/features/partners/partner-rail";
import type { Partner } from "@/types/partner";

type Props = {
  companySlug: string;
  partners: Partner[];
  rail: PartnerRailSettings;
  editable: boolean;
};

/** Rail list with expand + optional owner reorder / limit. */
export function PartnerRailList({
  companySlug,
  partners,
  rail,
  editable,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [order, setOrder] = useState(() => partners.map((p) => p.id));
  const [limit, setLimit] = useState(rail.limit);
  const [dirty, setDirty] = useState(false);

  const byId = useMemo(() => {
    const m = new Map(partners.map((p) => [p.id, p]));
    return m;
  }, [partners]);

  const ordered = useMemo(() => {
    const list: Partner[] = [];
    for (const id of order) {
      const p = byId.get(id);
      if (p) list.push(p);
    }
    for (const p of partners) {
      if (!order.includes(p.id)) list.push(p);
    }
    return list;
  }, [order, byId, partners]);

  const visible = expanded ? ordered : ordered.slice(0, limit);
  const hidden = Math.max(ordered.length - limit, 0);

  function move(id: string, dir: -1 | 1) {
    setOrder((prev) => {
      const i = prev.indexOf(id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const a = next[i];
      const b = next[j];
      next[i] = b;
      next[j] = a;
      return next;
    });
    setDirty(true);
  }

  return (
    <div>
      {editable ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3.5 py-2.5">
          <label className="flex items-center gap-1.5 text-[11px] text-muted">
            Show
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setDirty(true);
              }}
              className="h-7 rounded-lg border border-line bg-surface px-1.5 text-[11px] font-semibold text-ink"
            >
              {PARTNER_RAIL_LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            in rail
          </label>
          {dirty ? (
            <form action={savePartnerRail} className="ml-auto">
              <input type="hidden" name="company_slug" value={companySlug} />
              <input type="hidden" name="back" value={`/c/${companySlug}`} />
              <input type="hidden" name="limit" value={limit} />
              <input type="hidden" name="sort_ids" value={order.join(",")} />
              <button
                type="submit"
                className="h-7 rounded-lg bg-navy px-2.5 text-[11px] font-semibold text-white"
              >
                Save display
              </button>
            </form>
          ) : (
            <p className="ml-auto text-[10px] text-plus">
              Use ↑↓ to order · auto on map
            </p>
          )}
        </div>
      ) : null}

      <div
        className={
          expanded && ordered.length > limit
            ? "max-h-[min(70vh,36rem)] space-y-2 overflow-y-auto px-3.5 py-3.5"
            : "space-y-2 px-3.5 py-3.5"
        }
      >
        {visible.map((partner) => (
          <div key={partner.id} className="relative">
            {editable ? (
              <div className="absolute top-2 left-1 z-10 flex flex-col gap-0.5">
                <button
                  type="button"
                  aria-label={`Move ${partner.name} up`}
                  onClick={() => move(partner.id, -1)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-surface/90 text-[10px] text-muted shadow-sm hover:text-ink"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Move ${partner.name} down`}
                  onClick={() => move(partner.id, 1)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-surface/90 text-[10px] text-muted shadow-sm hover:text-ink"
                >
                  ↓
                </button>
              </div>
            ) : null}
            <div className={editable ? "pl-6" : undefined}>
              <PartnerCard
                partner={partner}
                editable={editable}
                manageBack={editable ? `/c/${companySlug}` : undefined}
              />
            </div>
          </div>
        ))}
      </div>

      {hidden > 0 ? (
        <div className="border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
          >
            {expanded
              ? "Show fewer"
              : `Show all ${ordered.length} partners`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
