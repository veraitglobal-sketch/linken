import {
  createSavedSearch,
  deleteSavedSearch,
} from "@/features/radar-leads/actions";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SavedSearch } from "@/types/radar-leads";

type Props = {
  searches: SavedSearch[];
  radarEnabled: boolean;
};

export function SavedSearchesPanel({ searches, radarEnabled }: Props) {
  if (!radarEnabled) return null;

  const atLimit = searches.length >= 5;

  return (
    <section id="saved-searches" className="scroll-mt-24">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Saved searches
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Up to 5 targets. Matching claimed firms land in Company leads.
          </p>
        </div>
        <p className="text-[12px] font-medium text-plus">
          {searches.length} of 5
        </p>
      </header>

      {searches.length > 0 ? (
        <WorkspaceCard padded={false} className="mb-4">
          <ul className="divide-y divide-line">
            {searches.map((s) => {
              const facets = [
                s.category,
                s.country,
                s.city,
                s.minTrustLevel ? `${s.minTrustLevel}+` : null,
                s.onlyVerified ? "verified" : null,
                s.onlyAccepting ? "accepting" : null,
              ].filter(Boolean);

              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">
                      {s.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {facets.length > 0
                        ? facets.join(" · ")
                        : "All claimed firms"}
                    </p>
                  </div>
                  <form action={deleteSavedSearch}>
                    <input type="hidden" name="search_id" value={s.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-9 px-3.5 text-[12px]"
                    >
                      Delete
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        </WorkspaceCard>
      ) : null}

      {atLimit ? (
        <p className="text-[13px] text-muted">
          Limit reached. Delete a search to add another.
        </p>
      ) : (
        <WorkspaceCard>
          <form action={createSavedSearch} className="grid gap-3 sm:grid-cols-2">
            <Input
              name="name"
              required
              placeholder="Name (e.g. FM firms Hamburg)"
              className="sm:col-span-2"
            />
            <Input name="category" placeholder="Category (optional)" />
            <Input name="country" placeholder="Country (optional)" />
            <Input name="city" placeholder="City (optional)" />
            <select
              name="min_trust_level"
              defaultValue=""
              className="h-12 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-blue focus:bg-surface"
            >
              <option value="">Any level</option>
              <option value="member">Member+</option>
              <option value="established">Established+</option>
              <option value="trusted">Trusted+</option>
              <option value="pillar">Pillar</option>
            </select>
            <label className="flex items-center gap-2 text-[13px] text-ink sm:col-span-2">
              <input
                type="checkbox"
                name="only_verified"
                defaultChecked
                className="h-4 w-4 rounded border-line"
              />
              Only verified
            </label>
            <label className="flex items-center gap-2 text-[13px] text-ink sm:col-span-2">
              <input
                type="checkbox"
                name="only_accepting"
                className="h-4 w-4 rounded border-line"
              />
              Only accepting clients
            </label>
            <Button type="submit" className="h-10 w-fit px-4 sm:col-span-2">
              Save search
            </Button>
          </form>
        </WorkspaceCard>
      )}
    </section>
  );
}
