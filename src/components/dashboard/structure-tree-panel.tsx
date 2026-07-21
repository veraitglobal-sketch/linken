import Link from "next/link";
import { StructureTree } from "@/components/dashboard/structure-tree";
import { StructureStat } from "@/components/dashboard/structure-ui";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import type { GroupMemberNode } from "@/features/groups/tree";

type Props = {
  rootName: string;
  groupName?: string;
  groupSlug?: string | null;
  confirmed: number;
  pending: number;
  subsidiaries: number;
  hasGroup: boolean;
  hasTree: boolean;
  roots: GroupMemberNode[];
  highlightCompanyId?: string;
};

export function StructureTreePanel({
  rootName,
  groupName,
  groupSlug,
  confirmed,
  pending,
  subsidiaries,
  hasGroup,
  hasTree,
  roots,
  highlightCompanyId,
}: Props) {
  return (
    <div className="space-y-8">
      {hasGroup ? (
        <div className="grid grid-cols-3 gap-2.5">
          <StructureStat label="In tree" value={String(confirmed)} />
          <StructureStat label="Pending" value={String(pending)} />
          <StructureStat label="Branches" value={String(subsidiaries)} />
        </div>
      ) : null}

      <section>
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
              Ownership tree
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              {hasTree && groupName
                ? `Who sits under whom in ${groupName}. Indent = nested branch.`
                : `No branches under ${rootName} yet — add one in Add firms.`}
            </p>
          </div>
          {groupSlug ? (
            <Link
              href={`/g/${groupSlug}`}
              className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Public group
            </Link>
          ) : null}
        </header>

        <WorkspaceCard padded={false} className="overflow-hidden">
          {hasTree ? (
            <>
              <div className="flex flex-wrap gap-3 border-b border-line bg-paper/40 px-4 py-2.5 text-[11px] text-muted">
                <span>
                  <span className="font-semibold text-ink">Root</span> — top of
                  the tree
                </span>
                <span>
                  <span className="font-semibold text-ink">You</span> — your
                  active company
                </span>
                <span>
                  <span className="font-semibold text-ember">Unclaimed</span> —
                  waiting for a local claim
                </span>
              </div>
              <StructureTree
                roots={roots}
                highlightCompanyId={highlightCompanyId}
              />
            </>
          ) : (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                {hasGroup ? "Tree is empty" : "No group yet"}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
                {hasGroup
                  ? "Create a subsidiary or invite a company — they show here after confirmation."
                  : "Create a group first, then add country branches."}
              </p>
              <Link
                href="/dashboard/structure?tab=grow"
                className="mt-4 inline-flex h-9 items-center rounded-xl border border-line px-3.5 text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
              >
                {hasGroup ? "Add firms" : "Create group"}
              </Link>
            </div>
          )}
        </WorkspaceCard>
      </section>
    </div>
  );
}
