"use client";

import { useEffect, useState } from "react";
import { InquiryForm } from "@/components/inquiries/inquiry-form";
import { LogoMark } from "@/components/ui/logo-mark";
import { fetchPublicTeamForPanel } from "@/features/team/panel-actions";
import {
  initialsFromName,
  type PublicTeamMember,
} from "@/features/team/types";
import { cn } from "@/lib/cn";

type Props = {
  companyId: string;
  companySlug: string;
  companyName: string;
  /** Hint from node payload — skip fetch / hide when 0. */
  publicTeamCount?: number;
  /** Redirect after inquiry (dashboard graph). */
  inquiryBack?: string;
};

const PREVIEW = 4;

export function GraphTeamSection({
  companyId,
  companySlug,
  companyName,
  publicTeamCount,
  inquiryBack = "/dashboard",
}: Props) {
  const [members, setMembers] = useState<PublicTeamMember[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedFor, setSelectedFor] = useState<PublicTeamMember | null>(null);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    if (!companyId || !publicTeamCount) return;
    let cancelled = false;
    void fetchPublicTeamForPanel(companyId).then((rows) => {
      if (!cancelled) setMembers(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [companyId, publicTeamCount]);

  // Modular profile: no public members → no Team block.
  if (!publicTeamCount) return null;

  if (members === null) {
    return (
      <div className="mt-3 border-t border-[#eef0f3] px-3 pt-3">
        <p className="text-[11px] text-muted">Loading team…</p>
      </div>
    );
  }
  if (members.length === 0) return null;

  const visible = expanded ? members : members.slice(0, PREVIEW);
  const hidden = members.length - PREVIEW;

  return (
    <div className="mt-3 border-t border-[#eef0f3] px-3 pt-3 pb-2">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
        Team
      </p>
      <ul className="mt-2 space-y-2">
        {visible.map((m) => {
          const selected =
            selectedFor?.displayName === m.displayName &&
            selectedFor?.displayTitle === m.displayTitle;
          return (
            <li key={`${m.displayName}-${m.displayTitle}`}>
              <button
                type="button"
                onClick={() =>
                  setSelectedFor((prev) =>
                    prev?.displayName === m.displayName &&
                    prev?.displayTitle === m.displayTitle
                      ? null
                      : m,
                  )
                }
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left transition-colors",
                  selected ? "bg-paper" : "hover:bg-paper",
                )}
                title="Optional: route inquiry to this person"
              >
                <LogoMark
                  initials={initialsFromName(m.displayName)}
                  logoUrl={m.photoUrl}
                  size="sm"
                  className="rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-ink">
                    {m.displayName}
                  </p>
                  {m.displayTitle ? (
                    <p className="truncate text-[11px] text-muted">
                      {m.displayTitle}
                    </p>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 text-[11px] font-semibold text-muted hover:text-ink"
        >
          Show all ({members.length})
        </button>
      ) : null}
      {expanded && hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-2 text-[11px] font-semibold text-muted hover:text-ink"
        >
          Show less
        </button>
      ) : null}

      <div className="mt-3">
        {!showContact ? (
          <button
            type="button"
            onClick={() => setShowContact(true)}
            className="h-9 w-full rounded-xl bg-[#0e1f1c] text-[12px] font-semibold text-white hover:bg-[#081412]"
          >
            Contact {companyName}
          </button>
        ) : (
          <InquiryForm
            companySlug={companySlug}
            companyName={companyName}
            defaultOpen
            appearance="panel"
            back={inquiryBack}
            forMember={
              selectedFor
                ? {
                    displayName: selectedFor.displayName,
                    displayTitle: selectedFor.displayTitle,
                  }
                : undefined
            }
            onCancel={() => setShowContact(false)}
          />
        )}
      </div>
    </div>
  );
}
