"use client";

import Link from "next/link";
import { useCallback, useId, useRef } from "react";
import { useFocusTrap } from "@/components/a11y/use-focus-trap";
import { detachGraphLink } from "@/features/network/actions";
import type { NetworkEdge } from "@/features/network/types";
import { Button } from "@/components/ui/button";

type Props = {
  edge: NetworkEdge;
  onCancel: () => void;
};

export function GraphDetachDialog({ edge, onCancel }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useCallback(() => onCancel(), [onCancel]);
  useFocusTrap(true, close, panelRef);

  if (!edge.detachable) {
    return (
      <div
        className="absolute inset-0 z-30 flex items-center justify-center bg-navy-deep/55 px-4"
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="w-full max-w-sm rounded-card border border-line bg-surface p-5 shadow-card"
        >
          <h2 id={titleId} className="font-display text-lg font-medium text-ink">
            Can’t detach here
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            Client links come from confirmed service references. Manage them on
            the company profile.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 h-11"
            onClick={onCancel}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-navy-deep/55 px-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-card border border-line bg-surface p-5 shadow-card"
      >
        <p className="text-[10px] font-semibold tracking-[0.12em] text-ember uppercase">
          Detach link
        </p>
        <h2
          id={titleId}
          className="mt-2 font-display text-lg font-medium tracking-[-0.03em] text-ink"
        >
          Remove this connection?
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {edge.type === "partner"
            ? "This removes the partnership from both profiles. Case study collaborations remain."
            : "This firm will leave the group structure (subsidiary / membership). Evidence on each profile stays."}
        </p>
        <form action={detachGraphLink} className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="edge_type" value={edge.type} />
          <input type="hidden" name="back" value="/dashboard" />
          {edge.meta?.partnershipId ? (
            <input
              type="hidden"
              name="partnership_id"
              value={edge.meta.partnershipId}
            />
          ) : null}
          {edge.meta?.groupId ? (
            <input type="hidden" name="group_id" value={edge.meta.groupId} />
          ) : null}
          {edge.meta?.memberCompanyId ? (
            <input
              type="hidden"
              name="company_id"
              value={edge.meta.memberCompanyId}
            />
          ) : null}
          <Button type="submit" className="h-11 bg-ember hover:bg-[#a8642e]">
            Detach
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-11"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </form>
        <p className="mt-3 text-[11px] text-muted">
          Or manage in{" "}
          <Link
            href="/dashboard/structure"
            className="font-semibold text-ink underline"
          >
            Structure
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
