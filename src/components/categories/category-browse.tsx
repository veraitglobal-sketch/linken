"use client";

import type { CategoryGroup } from "@/features/categories/taxonomy";
import type { CanonicalCategory } from "@/features/categories/taxonomy-types";

type Props = {
  groupId: string | null;
  groups: CategoryGroup[];
  leaves: CanonicalCategory[];
  onOpenGroup: (id: string) => void;
  onBack: () => void;
  onPick: (name: string, slug: string) => void;
};

export function CategoryBrowse({
  groupId,
  groups,
  leaves,
  onOpenGroup,
  onBack,
  onPick,
}: Props) {
  const active = groups.find((g) => g.id === groupId);

  return (
    <div className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-line bg-surface p-1 shadow-sm">
      {active ? (
        <>
          <button
            type="button"
            className="w-full rounded-md px-3 py-2 text-left text-[12px] font-semibold tracking-[0.08em] text-muted uppercase hover:bg-mute"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onBack}
          >
            ← All sectors
          </button>
          <p className="px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
            {active.name}
          </p>
          <ul>
            {leaves.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left text-[14px] text-ink hover:bg-mute"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPick(c.name, c.slug)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul>
          {groups.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[14px] text-ink hover:bg-mute"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onOpenGroup(g.id)}
              >
                <span>{g.name}</span>
                <span className="text-[12px] text-muted">{g.slugs.length}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
