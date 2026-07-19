import Link from "next/link";
import type { GroupMemberNode } from "@/features/groups/tree";
import { LogoMark } from "@/components/ui/logo-mark";

type Props = {
  roots: GroupMemberNode[];
  highlightCompanyId?: string;
};

export function StructureTree({ roots, highlightCompanyId }: Props) {
  if (roots.length === 0) {
    return (
      <p className="text-[14px] text-ink-soft">
        No confirmed members in the group tree yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
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
        className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-[#f0f2f4]"
        style={{ paddingLeft: `${8 + node.depth * 18}px` }}
      >
        {node.depth > 0 ? (
          <span
            className="mr-0.5 h-px w-3 shrink-0 bg-line"
            aria-hidden
          />
        ) : null}
        <LogoMark
          initials={node.logoInitials}
          logoUrl={node.logoUrl}
          size="sm"
          className="rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-[13px] font-semibold ${
              active ? "text-[#1f6b5c]" : "text-ink"
            }`}
          >
            {node.name}
            {active ? (
              <span className="ml-1.5 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
                you
              </span>
            ) : null}
          </p>
          <p className="truncate text-[11px] text-muted">
            {node.category}
            {node.city ? ` · ${node.city}` : ""}
          </p>
        </div>
        {!node.claimed ? (
          <span className="shrink-0 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
            Unclaimed
          </span>
        ) : null}
      </Link>
      {node.children.length > 0 ? (
        <ul>
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
