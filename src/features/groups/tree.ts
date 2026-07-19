import type { GroupMemberCard } from "@/features/groups/types";

export type GroupMemberNode = GroupMemberCard & {
  parentCompanyId: string | null;
  depth: number;
  children: GroupMemberNode[];
};

/** Build forest of confirmed members (roots = no parent or parent not in set). */
export function buildMemberTree(
  members: (GroupMemberCard & { parentCompanyId: string | null })[],
): GroupMemberNode[] {
  const byId = new Map<string, GroupMemberNode>();
  for (const m of members) {
    byId.set(m.companyId, {
      ...m,
      depth: 0,
      children: [],
    });
  }

  const roots: GroupMemberNode[] = [];
  for (const node of byId.values()) {
    const parentId = node.parentCompanyId;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function assignDepth(nodes: GroupMemberNode[], depth: number) {
    for (const n of nodes) {
      n.depth = depth;
      n.children.sort((a, b) => a.name.localeCompare(b.name));
      assignDepth(n.children, depth + 1);
    }
  }
  roots.sort((a, b) => a.name.localeCompare(b.name));
  assignDepth(roots, 0);
  return roots;
}

/** Flatten tree depth-first for indented lists. */
export function flattenMemberTree(roots: GroupMemberNode[]): GroupMemberNode[] {
  const out: GroupMemberNode[] = [];
  function walk(nodes: GroupMemberNode[]) {
    for (const n of nodes) {
      out.push(n);
      walk(n.children);
    }
  }
  walk(roots);
  return out;
}

type JsonOrg = {
  "@type": "Organization";
  name: string;
  url: string;
  subOrganization?: JsonOrg[];
};

export function memberTreeToJsonLd(
  roots: GroupMemberNode[],
  siteUrl: string,
): JsonOrg[] {
  function mapNode(n: GroupMemberNode): JsonOrg {
    const org: JsonOrg = {
      "@type": "Organization",
      name: n.name,
      url: `${siteUrl}/c/${n.slug}`,
    };
    if (n.children.length > 0) {
      org.subOrganization = n.children.map(mapNode);
    }
    return org;
  }
  return roots.map(mapNode);
}
