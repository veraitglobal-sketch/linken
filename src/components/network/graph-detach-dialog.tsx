"use client";

import Link from "next/link";
import { detachGraphLink } from "@/features/network/actions";
import type { NetworkEdge } from "@/features/network/types";
import { Button } from "@/components/ui/button";

type Props = {
  edge: NetworkEdge;
  onCancel: () => void;
};

export function GraphDetachDialog({ edge, onCancel }: Props) {
  if (!edge.detachable) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#081412]/55 px-4 backdrop-blur-[2px]">
        <div className="w-full max-w-sm rounded-[22px] border border-line bg-white p-5 shadow-[0_20px_50px_rgba(10,20,18,0.3)]">
          <p className="font-display text-lg font-medium text-ink">
            Can’t detach here
          </p>
          <p className="mt-2 text-[13px] text-muted">
            Client links come from confirmed service references. Manage them on
            the company profile.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 h-9"
            onClick={onCancel}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#081412]/55 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-[22px] border border-line bg-white p-5 shadow-[0_20px_50px_rgba(10,20,18,0.3)]">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-ember uppercase">
          Detach link
        </p>
        <p className="mt-2 font-display text-lg font-medium tracking-[-0.03em] text-ink">
          Remove this connection?
        </p>
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
          <Button type="submit" className="h-9 bg-ember hover:bg-[#a8642e]">
            Detach
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-9"
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
