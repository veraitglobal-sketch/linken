"use client";

import {
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { LogoTile } from "@/components/ui/logo-tile";
import { GraphInviteTeamForm } from "@/components/network/graph-invite-team-form";
import { GraphPendingInvites } from "@/components/network/graph-pending-invites";
import { GraphTeamSection } from "@/components/network/graph-team-section";
import {
  searchCompaniesForGraph,
  type CompanySearchHit,
} from "@/features/companies/search-action";
import { createSubsidiary } from "@/features/groups/actions";
import { addExistingCompanyToWorkspace } from "@/features/network/graph-actions";
import {
  fetchTeamManageAccess,
  type TeamManageAccess,
} from "@/features/team/panel-actions";
import type {
  NetworkGraphContext,
  NetworkNodeData,
} from "@/features/network/types";
import { cn } from "@/lib/cn";

const ROLE_LABEL = {
  group: "Group",
  company: "Company",
  subsidiary: "Child firm",
  partner: "Partner",
  client: "Client",
} as const;

export type PanelMode = "inspect" | "add";

type Props = {
  open: boolean;
  mode: PanelMode;
  selected: NetworkNodeData | null;
  context?: NetworkGraphContext;
  editable?: boolean;
  onClose: () => void;
  onOpenAdd: () => void;
  onFlash: (msg: string, isError?: boolean) => void;
};

export function GraphSidePanel({
  open,
  mode,
  selected,
  context,
  editable = false,
  onClose,
  onOpenAdd,
  onFlash,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CompanySearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [activeHit, setActiveHit] = useState<string | null>(null);
  const [teamAccess, setTeamAccess] = useState<TeamManageAccess | null>(null);
  const [showInviteTeam, setShowInviteTeam] = useState(false);
  const [inviteFlash, setInviteFlash] = useState<string | null>(null);
  const [pendingRefresh, setPendingRefresh] = useState(0);

  const parentCompanyId =
    selected?.kind !== "group" ? selected?.companyId ?? null : null;
  const canInviteToGroup = Boolean(context?.groupId) && editable;
  const canCreateUnder =
    canInviteToGroup && Boolean(parentCompanyId || selected?.kind === "group");
  const manageCompanyId =
    mode === "inspect" && selected?.kind !== "group"
      ? selected?.companyId ?? null
      : null;

  const accessKey =
    open && manageCompanyId ? manageCompanyId : "";
  const [trackedAccessKey, setTrackedAccessKey] = useState(accessKey);
  if (trackedAccessKey !== accessKey) {
    setTrackedAccessKey(accessKey);
    setTeamAccess(null);
    setShowInviteTeam(false);
    setInviteFlash(null);
  }

  useEffect(() => {
    if (!accessKey) return;
    let cancelled = false;
    void fetchTeamManageAccess(accessKey).then((access) => {
      if (!cancelled) setTeamAccess(access);
    });
    return () => {
      cancelled = true;
    };
  }, [accessKey]);

  useEffect(() => {
    if (!open || mode !== "add") return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const rows = await searchCompaniesForGraph(query);
        if (!cancelled) setHits(rows);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, query.trim() ? 220 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open, mode, query]);

  const [trackedOpen, setTrackedOpen] = useState(open);
  if (trackedOpen !== open) {
    setTrackedOpen(open);
    if (!open) {
      setQuery("");
      setShowCreate(false);
      setActiveHit(null);
      setShowInviteTeam(false);
      setInviteFlash(null);
    }
  }

  function addCompany(hit: CompanySearchHit, intent: "partner" | "group") {
    setActiveHit(hit.id);
    startTransition(async () => {
      const result = await addExistingCompanyToWorkspace({
        companySlug: hit.slug,
        intent,
        groupId: context?.groupId,
        parentCompanyId: intent === "group" ? parentCompanyId : null,
      });
      setActiveHit(null);
      if (!result.ok) {
        onFlash(result.error, true);
        return;
      }
      onFlash(result.message ?? "Added.");
      router.refresh();
    });
  }

  if (!open) return null;

  return (
    <aside
      className={cn(
        "absolute inset-y-0 right-0 z-30 flex w-[min(100%,22.5rem)] flex-col border-l border-[#e2e8f0] bg-white shadow-[-16px_0_40px_rgba(15,23,42,0.08)]",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#f1f5f9] px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-ink">
            {mode === "add"
              ? "Add a company"
              : selected
                ? selected.name
                : "Company"}
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-[#64748b]">
            {mode === "add"
              ? selected && selected.kind !== "group"
                ? `Search firms to attach near ${selected.name}.`
                : "Search an existing company to add to this workspace."
              : "A step that belongs to your network graph."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9aa3af] transition-colors hover:bg-[#f5f6f8] hover:text-ink"
          aria-label="Close panel"
        >
          <CloseIcon />
        </button>
      </div>

      {mode === "inspect" && selected ? (
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="px-3 py-3">
            <div className="flex items-start gap-3">
              <LogoTile
                name={selected.name}
                initials={selected.logoInitials}
                logoUrl={selected.logoUrl}
                website={selected.website}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-[#9aa3af] uppercase">
                  {ROLE_LABEL[selected.kind]}
                </p>
                <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em] text-ink">
                  {selected.name}
                </p>
                <p className="mt-0.5 text-[12px] text-[#5b6472]">
                  {[selected.category, selected.city].filter(Boolean).join(" · ") ||
                    "—"}
                </p>
              </div>
            </div>
            {selected.kind !== "group" && selected.domainVerified === false ? (
              selected.companyId &&
              selected.companyId === context?.viewerCompanyId ? (
                <a
                  href="/dashboard/verification"
                  className="mt-3 block rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2.5 transition-colors hover:border-[#fbbf24] hover:bg-[#fff7ed]"
                >
                  <p className="text-[12px] font-semibold text-[#92400e]">
                    Domain not verified
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#a16207]">
                    Verify ownership (DNS, meta tag, or email) to unlock linking
                    — open verification →
                  </p>
                </a>
              ) : (
                <div className="mt-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2.5">
                  <p className="text-[12px] font-semibold text-[#92400e]">
                    Domain not verified
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#a16207]">
                    Links stay limited until this firm verifies ownership of its
                    website domain (DNS, meta tag, or email).
                  </p>
                </div>
              )
            ) : null}
            {selected.kind !== "group" && selected.domainVerified !== false ? (
              <p className="mt-3 text-[12px] text-[#5b6472]">
                {selected.stats.confirmedPartners} partners ·{" "}
                {selected.stats.confirmedReferences} references
                {selected.domainVerified ? " · Domain verified" : ""}
              </p>
            ) : null}
          </div>

          {selected.kind !== "group" && selected.companyId ? (
            <GraphTeamSection
              key={selected.companyId}
              companyId={selected.companyId}
              companySlug={selected.slug}
              companyName={selected.name}
              publicTeamCount={selected.publicTeamCount}
              inquiryBack="/dashboard"
            />
          ) : null}

          {teamAccess?.canManage && selected.companyId ? (
            <GraphPendingInvites
              key={`pending-${selected.companyId}`}
              companyId={selected.companyId}
              refreshKey={pendingRefresh}
            />
          ) : null}

          {inviteFlash ? (
            <p className="mx-3 mt-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[12px] font-medium text-ink">
              Invitation sent to {inviteFlash}
            </p>
          ) : null}

          {showInviteTeam &&
          teamAccess?.canManage &&
          selected.companyId ? (
            <div className="px-3 pt-2">
              <GraphInviteTeamForm
                companyId={selected.companyId}
                canInviteAdmin={teamAccess.canInviteAdmin}
                onCancel={() => setShowInviteTeam(false)}
                onSent={(email) => {
                  setShowInviteTeam(false);
                  setInviteFlash(email);
                  setPendingRefresh((n) => n + 1);
                }}
              />
            </div>
          ) : null}

          <ul className="mt-1">
            {selected.kind !== "group" &&
            selected.domainVerified === false &&
            selected.companyId &&
            selected.companyId === context?.viewerCompanyId ? (
              <PanelRow
                icon={<ShieldIcon />}
                title="Verify domain"
                description="DNS TXT, meta tag, or matching email — required to link firms"
                href="/dashboard/verification"
                chevron
                accent
              />
            ) : null}
            {teamAccess?.canManage && !showInviteTeam ? (
              <PanelRow
                icon={<PersonPlusIcon />}
                title="Add team member"
                description="Invite by email — they join after accepting"
                onClick={() => {
                  setInviteFlash(null);
                  setShowInviteTeam(true);
                }}
                chevron
                accent
              />
            ) : null}
            {editable ? (
              <PanelRow
                icon={<PlusIcon />}
                title="Add company"
                description="Partner (dashed) or child firm under ownership (solid arrow)"
                onClick={onOpenAdd}
                chevron
                accent={selected.domainVerified !== false}
              />
            ) : null}
            {selected.href && selected.href !== "#" ? (
              <PanelRow
                icon={<ExternalIcon />}
                title="Open profile"
                description="View the public company page"
                href={selected.href}
                chevron
              />
            ) : null}
          </ul>
        </div>
      ) : null}

      {mode === "add" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-3 pb-2">
            <label className="relative block">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9aa3af]">
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search companies…"
                autoFocus
                className="h-11 w-full rounded-xl border border-[#d8dde6] bg-white pr-3 pl-10 text-[13px] text-ink outline-none transition-colors placeholder:text-[#9aa3af] focus:border-ink"
              />
            </label>
            {searching ? (
              <p className="mt-2 px-1 text-[11px] text-[#9aa3af]">Searching…</p>
            ) : null}
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {hits.map((hit) => {
              const busy = pending && activeHit === hit.id;
              return (
                <li
                  key={hit.id}
                  className="group relative rounded-xl px-3 py-3 transition-colors hover:bg-[#f5f6f8]"
                >
                  <div className="pointer-events-none absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-transparent group-hover:bg-[#f59e0b]" />
                  <div className="flex items-start gap-3">
                    <LogoTile
                      name={hit.name}
                      initials={hit.logoInitials}
                      logoUrl={hit.logoUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-ink">
                        {hit.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#5b6472]">
                        {[hit.category, hit.city].filter(Boolean).join(" · ") ||
                          "—"}
                        {!hit.claimed ? " · Unclaimed" : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={pending || !hit.claimed}
                          onClick={() => addCompany(hit, "partner")}
                          className="h-7 rounded-lg border border-[#e8eaee] bg-white px-2.5 text-[11px] font-semibold text-ink disabled:opacity-40"
                          title="Mutual partnership (dashed link)"
                        >
                          {busy ? "…" : "As partner"}
                        </button>
                        {canInviteToGroup ? (
                          <button
                            type="button"
                            disabled={pending || !hit.claimed}
                            onClick={() => addCompany(hit, "group")}
                            className="h-7 rounded-lg bg-ink px-2.5 text-[11px] font-semibold text-white disabled:opacity-40"
                            title="Invite into group — can hang under a parent as child firm"
                          >
                            As child firm
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {!searching && hits.length === 0 ? (
              <li className="px-3 py-6 text-center text-[12px] text-[#9aa3af]">
                No companies match that search.
              </li>
            ) : null}

            {canCreateUnder ? (
              <li className="mt-2 border-t border-[#eef0f3] pt-2">
                <PanelRow
                  icon={<BuildingIcon />}
                  title="Create child firm"
                  description="New company owned under this parent (ćerka firma)"
                  onClick={() => setShowCreate((v) => !v)}
                  chevron
                />
                {showCreate && context?.groupId ? (
                  <form
                    action={createSubsidiary}
                    className="mt-2 space-y-2 rounded-xl bg-[#f7f8fa] px-3 py-3"
                  >
                    <input type="hidden" name="group_id" value={context.groupId} />
                    {parentCompanyId ? (
                      <input
                        type="hidden"
                        name="parent_company_id"
                        value={parentCompanyId}
                      />
                    ) : null}
                    <input type="hidden" name="back" value="/dashboard" />
                    <input
                      name="name"
                      required
                      placeholder="Company name"
                      className="h-9 w-full rounded-lg border border-[#e8eaee] bg-white px-3 text-[12px] outline-none focus:border-ink"
                    />
                    <input
                      name="category"
                      required
                      placeholder="Category"
                      className="h-9 w-full rounded-lg border border-[#e8eaee] bg-white px-3 text-[12px] outline-none focus:border-ink"
                    />
                    <input
                      name="city"
                      required
                      placeholder="City"
                      className="h-9 w-full rounded-lg border border-[#e8eaee] bg-white px-3 text-[12px] outline-none focus:border-ink"
                    />
                    <button
                      type="submit"
                      className="h-9 w-full rounded-lg bg-ink text-[12px] font-semibold text-white"
                    >
                      Create subsidiary
                    </button>
                  </form>
                ) : null}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

function PanelRow({
  icon,
  title,
  description,
  onClick,
  href,
  chevron,
  accent,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
  chevron?: boolean;
  accent?: boolean;
}) {
  const className = cn(
    "group relative flex w-full items-start gap-3 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-[#f5f6f8]",
  );

  const body = (
    <>
      {accent ? (
        <span className="pointer-events-none absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-[#f59e0b] opacity-0 transition-opacity group-hover:opacity-100" />
      ) : null}
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-ink">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-[#5b6472]">
          {description}
        </span>
      </span>
      {chevron ? (
        <span className="mt-1 text-[#c0c6d0]">
          <ChevronIcon />
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <li>
        <a href={href} className={className}>
          {body}
        </a>
      </li>
    );
  }

  return (
    <li>
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    </li>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M16.5 16.5L21 21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PersonPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 19a4.5 4.5 0 0 0-9 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M18 8v6M15 11h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 5h5v5M19 5l-9 9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20V6l8-3 8 3v14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9 20v-6h6v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 19 6.5v5.2c0 4.4-2.9 7.4-7 8.8-4.1-1.4-7-4.4-7-8.8V6.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 12 1.9 1.9 3.7-3.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
