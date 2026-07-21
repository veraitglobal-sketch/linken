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
      <p className="px-5 py-10 text-center text-[13px] text-muted sm:px-6">
        No confirmed members in the tree yet.
      </p>
    );
  }

  return (
    <ul className="space-y-0 px-2 py-2 sm:px-3 sm:py-3">
      {roots.map((node) => (
        <TreeNode
          key={node.companyId}
          node={node}
          highlightCompanyId={highlightCompanyId}
          isLast
        />
      ))}
    </ul>
  );
}

function TreeNode({
  node,
  highlightCompanyId,
  isLast,
}: {
  node: GroupMemberNode;
  highlightCompanyId?: string;
  isLast: boolean;
}) {
  const active = node.companyId === highlightCompanyId;
  const hasKids = node.children.length > 0;

  return (
    <li className="relative">
      {node.depth > 0 ? (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-[11px] w-px bg-line sm:left-[15px]"
          style={{
            height: isLast && !hasKids ? "1.4rem" : undefined,
          }}
        />
      ) : null}

      <div
        className="relative flex items-stretch gap-0"
        style={{ paddingLeft: node.depth > 0 ? undefined : 0 }}
      >
        {node.depth > 0 ? (
          <div
            className="relative w-7 shrink-0 sm:w-8"
            aria-hidden
          >
            <span className="absolute top-5 left-[11px] h-px w-3.5 bg-line sm:left-[15px] sm:w-4" />
          </div>
        ) : null}

        <Link
          href={`/c/${node.slug}`}
          className={cn(
            "mb-1.5 flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 ring-1 transition-colors",
            active
              ? "bg-accent-soft/80 ring-blue/20"
              : "bg-surface ring-line hover:bg-paper",
          )}
        >
          <LogoTile
            name={node.name}
            initials={node.logoInitials}
            logoUrl={node.logoUrl}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className={cn(
                  "truncate text-[14px] font-semibold tracking-[-0.02em]",
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
              {!node.claimed ? (
                <span className="shrink-0 rounded-md bg-ember/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.06em] text-ember uppercase">
                  Unclaimed
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-muted">
              {node.depth === 0 ? "Root" : `Branch · level ${node.depth}`}
              {node.city ? ` · ${node.city}` : ""}
              {node.country ? `, ${node.country}` : ""}
            </p>
          </div>
        </Link>
      </div>

      {hasKids ? (
        <ul className="relative ml-0">
          {node.children.map((child, i) => (
            <TreeNode
              key={child.companyId}
              node={child}
              highlightCompanyId={highlightCompanyId}
              isLast={i === node.children.length - 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
