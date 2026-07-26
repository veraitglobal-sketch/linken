import { LogoTile } from "@/components/ui/logo-tile";
import { createSubsidiary } from "@/features/groups/actions";
import type { CompanySearchHit } from "@/features/companies/search-action";
import type { NetworkGraphContext } from "@/features/network/types";
import { BuildingIcon, SearchIcon } from "@/components/network/graph-panel-icons";
import { PanelRow } from "@/components/network/graph-panel-row";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  hits: CompanySearchHit[];
  searching: boolean;
  pending: boolean;
  activeHit: string | null;
  canInviteToGroup: boolean;
  canCreateUnder: boolean;
  showCreate: boolean;
  onToggleCreate: () => void;
  context?: NetworkGraphContext;
  parentCompanyId: string | null;
  onAddCompany: (hit: CompanySearchHit, intent: "partner" | "group") => void;
};

export function GraphPanelAdd({
  query,
  onQueryChange,
  hits,
  searching,
  pending,
  activeHit,
  canInviteToGroup,
  canCreateUnder,
  showCreate,
  onToggleCreate,
  context,
  parentCompanyId,
  onAddCompany,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pt-3 pb-2">
        <label className="relative block">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-plus">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search companies…"
            autoFocus
            className="h-11 w-full rounded-2xl border border-line bg-surface pr-3 pl-10 text-[13px] text-ink outline-none transition-colors placeholder:text-plus focus:border-blue"
          />
        </label>
        {searching ? (
          <p className="mt-2 px-1 text-[11px] text-plus">Searching…</p>
        ) : null}
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {hits.map((hit) => {
          const busy = pending && activeHit === hit.id;
          return (
            <li
              key={hit.id}
              className="group relative rounded-2xl px-3 py-3 transition-colors hover:bg-paper"
            >
              <div className="pointer-events-none absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-transparent group-hover:bg-blue" />
              <div className="flex items-start gap-3">
                <LogoTile
                  name={hit.name}
                  initials={hit.logoInitials}
                  logoUrl={hit.logoUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-ink">{hit.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {[hit.category, hit.city].filter(Boolean).join(" · ") || "—"}
                    {!hit.claimed ? " · Unclaimed" : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {canInviteToGroup ? (
                      <button
                        type="button"
                        disabled={pending || !hit.claimed}
                        onClick={() => onAddCompany(hit, "group")}
                        className="h-7 rounded-xl bg-navy px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
                        title="Invite into group — can hang under a parent as child firm"
                      >
                        {busy ? "…" : "As child firm"}
                      </button>
                    ) : (
                      <p className="text-[11px] text-muted">
                        Add partners on Company — they appear here after confirm.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {!searching && hits.length === 0 ? (
          <li className="px-3 py-6 text-center text-[12px] text-plus">
            No companies match that search.
          </li>
        ) : null}

        {canCreateUnder ? (
          <li className="mt-2 border-t border-line pt-2">
            <PanelRow
              icon={<BuildingIcon />}
              title="Create child firm"
              description="New company owned under this parent"
              onClick={onToggleCreate}
              chevron
            />
            {showCreate && context?.groupId ? (
              <form
                action={createSubsidiary}
                className="mt-2 space-y-2 rounded-2xl bg-paper px-3 py-3"
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
                  className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-[12px] outline-none focus:border-blue"
                />
                <input
                  name="category"
                  required
                  placeholder="Category"
                  className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-[12px] outline-none focus:border-blue"
                />
                <input
                  name="city"
                  required
                  placeholder="City"
                  className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-[12px] outline-none focus:border-blue"
                />
                <input
                  name="website"
                  type="url"
                  placeholder="Website (optional)"
                  className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-[12px] outline-none focus:border-blue"
                />
                <input
                  name="services"
                  placeholder="Services, comma separated (optional)"
                  className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-[12px] outline-none focus:border-blue"
                />
                <input
                  name="invite_email"
                  type="email"
                  placeholder="Invite email (optional)"
                  className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-[12px] outline-none focus:border-blue"
                />
                <button
                  type="submit"
                  className="h-9 w-full rounded-xl bg-navy text-[12px] font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  Create subsidiary
                </button>
              </form>
            ) : null}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
