"use client";

import Link from "next/link";
import { useState } from "react";
import { createSubsidiary } from "@/features/groups/actions";
import type {
  NetworkEdge,
  NetworkGraphContext,
  NetworkNodeData,
} from "@/features/network/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoTile } from "@/components/ui/logo-tile";
import { PRODUCT } from "@/lib/product-model";

const ROLE_LABEL = {
  group: "Group hub",
  company: "Company",
  subsidiary: "Subsidiary",
  partner: "Partner",
  client: "Client",
} as const;

type Props = {
  selected: NetworkNodeData;
  selectedId: string;
  edges: NetworkEdge[];
  context?: NetworkGraphContext;
  onClose: () => void;
  onSelectEdge: (edge: NetworkEdge) => void;
};

/** Inspect a node — partners are added on Company, not here. */
export function GraphInspector({
  selected,
  selectedId,
  edges,
  context,
  onClose,
  onSelectEdge,
}: Props) {
  const [mode, setMode] = useState<"idle" | "subsidiary">("idle");
  const canAddUnder =
    Boolean(context?.groupId) &&
    Boolean(selected.companyId) &&
    (selected.kind === "company" || selected.kind === "subsidiary");

  const related = edges.filter(
    (e) => e.source === selectedId || e.target === selectedId,
  );

  return (
    <div className="absolute top-3 right-3 z-20 w-[min(100%-1.5rem,19rem)] overflow-hidden rounded-[22px] border border-white/15 bg-white shadow-[0_20px_50px_rgba(10,20,18,0.28)]">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-[#1a5c51] uppercase">
          {ROLE_LABEL[selected.kind]}
        </p>
        <div className="mt-2 flex items-start gap-3">
          <LogoTile
            name={selected.name}
            initials={selected.logoInitials}
            logoUrl={selected.logoUrl}
            website={selected.website}
            allowFavicon
            size="md"
          />
          <div className="min-w-0">
            <p className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
              {selected.name}
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              {[selected.category, selected.city].filter(Boolean).join(" · ") ||
                "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        {selected.kind !== "group" ? (
          <p className="text-[12px] text-muted">
            {selected.stats.confirmedPartners} partners ·{" "}
            {selected.stats.confirmedReferences} references
          </p>
        ) : null}

        {selected.kind === "company" || selected.kind === "subsidiary" ? (
          <p className="text-[12px] leading-relaxed text-muted">
            Partners appear after both sides confirm on{" "}
            {selected.href && selected.href !== "#" ? (
              <Link
                href={selected.href}
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                {PRODUCT.company.label}
              </Link>
            ) : (
              PRODUCT.company.label
            )}
            .
          </p>
        ) : null}

        {canAddUnder ? (
          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === "subsidiary" ? "idle" : "subsidiary"))
            }
            className="h-9 w-full rounded-xl border border-line bg-[#f7f8fa] px-3 text-left text-[12px] font-semibold text-ink transition-colors hover:border-[#1a5c51]/35"
          >
            + Add subsidiary under {selected.name}
          </button>
        ) : null}

        {mode === "subsidiary" && context?.groupId && selected.companyId ? (
          <form
            action={createSubsidiary}
            className="space-y-2 rounded-xl border border-line bg-[#f7f8fa] p-3"
          >
            <input type="hidden" name="group_id" value={context.groupId} />
            <input
              type="hidden"
              name="parent_company_id"
              value={selected.companyId}
            />
            <input type="hidden" name="back" value="/dashboard" />
            <Input name="name" required placeholder="Subsidiary name" />
            <Input name="category" required placeholder="Category" />
            <Input name="city" required placeholder="City" />
            <Input name="country" placeholder="Country" />
            <Input name="website" type="url" placeholder="https://" />
            <Button type="submit" className="h-9 w-full">
              Create & attach
            </Button>
          </form>
        ) : null}

        {related.length > 0 ? (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">
              Connections
            </p>
            <ul className="mt-1.5 max-h-36 space-y-1 overflow-y-auto">
              {related.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => onSelectEdge(e)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[#f0f2f4]"
                  >
                    <span className="truncate font-medium text-ink">
                      {e.meta?.label ?? e.type.replace("_", " ")}
                    </span>
                    {e.detachable ? (
                      <span className="shrink-0 text-[10px] font-semibold tracking-[0.06em] text-ember uppercase">
                        Detach
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] text-muted">view</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {selected.href && selected.href !== "#" ? (
          <Button href={selected.href} variant="secondary" className="h-9 w-full">
            View profile →
          </Button>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-[12px] font-medium text-muted hover:text-ink"
        >
          Close
        </button>
      </div>
    </div>
  );
}
