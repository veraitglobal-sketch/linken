import Link from "next/link";
import { LogoTile } from "@/components/ui/logo-tile";
import type { GroupMemberNode } from "@/features/groups/tree";
import { cn } from "@/lib/cn";

type Props = {
  roots: GroupMemberNode[];
  highlightCompanyId?: string;
};

export function StructureTree({ roots, highlightCompanyId }: Props) {
  if (roots.length === 0) {
    return (
      <p className="px-1 py-8 text-center text-[13px] text-muted">
        No confirmed members in the group tree yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {roots.map((node) => (
        <TreeNode
          key={node.companyId}
          node={node}
          highlightCompanyId={highlightCompanyId}
        />
      ))}
    </ul>
  );
}

function TreeNode({
  node,
  highlightCompanyId,
}: {
  node: GroupMemberNode;
  highlightCompanyId?: string;
}) {
  const active = node.companyId === highlightCompanyId;

  return (
    <li>
      <Link
        href={`/c/${node.slug}`}
        className={cn(
          "flex items-center gap-3 rounded-xl border-l-[3px] bg-surface px-3 py-2.5 ring-1 transition-colors",
          active
            ? "border-l-blue bg-accent-soft/80 ring-blue/15"
            : "border-l-transparent ring-line hover:bg-paper hover:ring-line",
          node.depth === 0 && !active && "border-l-navy/40",
        )}
        style={{ marginLeft: node.depth * 18 }}
      >
        <LogoTile
          name={node.name}
          initials={node.logoInitials}
          logoUrl={node.logoUrl}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "truncate text-[13px] font-semibold tracking-[-0.02em]",
                active ? "text-blue" : "text-ink",
              )}
            >
              {node.name}
            </span>
            {active ? (
              <span className="shrink-0 rounded-md bg-navy px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.08em] text-white uppercase">
                You
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted">
            {node.depth === 0 ? "Root" : "Subsidiary"}
            {node.category ? ` · ${node.category}` : ""}
            {node.city ? ` · ${node.city}` : ""}
          </p>
        </div>
        {!node.claimed ? (
          <span className="shrink-0 rounded-md bg-ember/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.06em] text-ember uppercase">
            Unclaimed
          </span>
        ) : null}
      </Link>
      {node.children.length > 0 ? (
        <ul className="mt-1.5 space-y-1.5">
          {node.children.map((child) => (
            <TreeNode
              key={child.companyId}
              node={child}
              highlightCompanyId={highlightCompanyId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
