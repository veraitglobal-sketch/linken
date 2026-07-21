import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { getTrustProfile } from "@/features/trust/queries";
import type {
  NetworkEdge,
  NetworkEdgeMeta,
  NetworkGraph,
  NetworkGraphContext,
  NetworkGraphSummary,
  NetworkNode,
  NetworkNodeData,
  NetworkNodeKind,
  NetworkScope,
} from "@/features/network/types";
import { getPublicTeam } from "@/features/team/queries";
import { initialsFromName } from "@/features/team/types";
import { createClient } from "@/lib/supabase/server";

const MAX_NODES = 120;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  claimed: boolean | null;
  verified?: boolean | null;
  logo_url?: string | null;
  website?: string | null;
  logo_source?: string | null;
};

type MemberRow = CompanyRow & {
  country: string | null;
  parentCompanyId: string | null;
};

const emptySummary = (): NetworkGraphSummary => ({
  companies: 0,
  subsidiaries: 0,
  partners: 0,
  clients: 0,
});

function summarize(nodes: NetworkNode[]): NetworkGraphSummary {
  const s = emptySummary();
  for (const n of nodes) {
    if (n.data.moreCount) continue;
    switch (n.data.kind) {
      case "company":
        s.companies += 1;
        break;
      case "subsidiary":
        s.subsidiaries += 1;
        break;
      case "partner":
        s.partners += 1;
        break;
      case "client":
        s.clients += 1;
        break;
      default:
        break;
    }
  }
  return s;
}

async function companyNode(
  row: CompanyRow,
  kind: NetworkNodeKind,
): Promise<NetworkNode> {
  const trust = await getTrustProfile(row.id, row.slug);
  const data: NetworkNodeData = {
    slug: row.slug,
    name: row.name,
    logoInitials: initials(row.name),
    logoUrl: companyDisplayLogoUrl({
      logoUrl: row.logo_url,
      website: row.website,
    }),
    website: row.website ?? null,
    logoSource: row.logo_source ?? null,
    category: row.category ?? "",
    city: row.city ?? "",
    trustLevel: row.claimed === false ? null : trust.level,
    kind,
    companyId: row.id,
    domainVerified: row.claimed !== false && Boolean(row.verified),
    stats: {
      confirmedPartners: trust.breakdown.confirmedPartners,
      confirmedReferences:
        trust.breakdown.confirmedReferences + trust.breakdown.ongoingReferences,
    },
    href: `/c/${row.slug}`,
  };
  return { id: `company:${row.id}`, data };
}

async function fetchCompaniesByIds(
  ids: string[],
): Promise<Map<string, CompanyRow>> {
  const unique = [...new Set(ids)].filter(Boolean);
  const map = new Map<string, CompanyRow>();
  if (unique.length === 0) return map;

  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select(
      "id, slug, name, category, city, claimed, verified, logo_url, website, logo_source",
    )
    .in("id", unique);

  for (const row of data ?? []) {
    map.set(row.id, row);
  }
  return map;
}

type PartnerLink = { partnerId: string; partnershipId: string };

async function acceptedPartnershipsForMany(
  companyIds: string[],
): Promise<Map<string, PartnerLink[]>> {
  const result = new Map<string, PartnerLink[]>();
  if (companyIds.length === 0) return result;

  const supabase = await createClient();
  const [asReq, asRec] = await Promise.all([
    supabase
      .from("partnerships")
      .select("id, requester_id, recipient_id")
      .eq("status", "accepted")
      .in("requester_id", companyIds),
    supabase
      .from("partnerships")
      .select("id, requester_id, recipient_id")
      .eq("status", "accepted")
      .in("recipient_id", companyIds),
  ]);

  const add = (from: string, partnerId: string, partnershipId: string) => {
    const list = result.get(from) ?? [];
    if (list.some((l) => l.partnershipId === partnershipId)) return;
    list.push({ partnerId, partnershipId });
    result.set(from, list);
  };

  for (const r of asReq.data ?? []) {
    add(
      r.requester_id as string,
      r.recipient_id as string,
      r.id as string,
    );
  }
  for (const r of asRec.data ?? []) {
    add(
      r.recipient_id as string,
      r.requester_id as string,
      r.id as string,
    );
  }

  return result;
}

async function confirmedClientsForMany(
  providerIds: string[],
): Promise<Map<string, { id: string; ongoing: boolean }[]>> {
  const result = new Map<string, { id: string; ongoing: boolean }[]>();
  if (providerIds.length === 0) return result;

  const supabase = await createClient();
  const { data } = await supabase
    .from("service_references")
    .select("provider_company_id, client_company_id, ongoing")
    .in("provider_company_id", providerIds)
    .eq("status", "confirmed")
    .not("client_company_id", "is", null);

  const nested = new Map<string, Map<string, boolean>>();
  for (const row of data ?? []) {
    const provider = row.provider_company_id as string;
    const client = row.client_company_id as string;
    if (!provider || !client) continue;
    const map = nested.get(provider) ?? new Map();
    map.set(client, map.get(client) === true || Boolean(row.ongoing));
    nested.set(provider, map);
  }

  for (const [provider, clients] of nested) {
    const list = [...clients.entries()]
      .map(([id, ongoing]) => ({ id, ongoing }))
      .sort((a, b) => Number(b.ongoing) - Number(a.ongoing));
    result.set(provider, list);
  }
  return result;
}

function edge(
  type: NetworkEdge["type"],
  source: string,
  target: string,
  opts?: { detachable?: boolean; meta?: NetworkEdgeMeta },
): NetworkEdge {
  return {
    id: `${type}:${source}->${target}`,
    source,
    target,
    type,
    detachable: opts?.detachable,
    meta: opts?.meta,
  };
}

function trimGraph(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  hubId: string,
  context?: NetworkGraphContext,
): NetworkGraph {
  if (nodes.length <= MAX_NODES) {
    return { nodes, edges, summary: summarize(nodes), context };
  }

  const keep = new Set<string>([hubId]);
  const priority = [
    ...edges.filter((e) => e.type === "subsidiary"),
    ...edges.filter((e) => e.type === "co_owner"),
    ...edges.filter((e) => e.type === "member_of"),
    ...edges.filter((e) => e.type === "client"),
    ...edges.filter((e) => e.type === "partner"),
  ];

  for (const e of priority) {
    if (keep.size >= MAX_NODES - 1) break;
    keep.add(e.source);
    keep.add(e.target);
  }

  const keptNodes = nodes.filter((n) => keep.has(n.id));
  const omitted = nodes.length - keptNodes.length;
  if (omitted > 0) {
    keptNodes.push({
      id: "more",
      data: {
        slug: "",
        name: `+${omitted} more`,
        logoInitials: "+",
        logoUrl: null,
        category: "Network",
        city: "",
        trustLevel: null,
        kind: "partner",
        stats: { confirmedPartners: 0, confirmedReferences: 0 },
        href: "#",
        moreCount: omitted,
      },
    });
  }

  const keptEdges = edges.filter(
    (e) => keep.has(e.source) && keep.has(e.target),
  );
  return {
    nodes: keptNodes,
    edges: keptEdges,
    summary: summarize(keptNodes),
    context,
  };
}

type CoOwnerLink = { childId: string; coParentId: string; id: string };

/** Confirmed extra owners (joint ventures) — additive on top of the primary tree. */
async function loadConfirmedCoOwners(groupId: string): Promise<CoOwnerLink[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_co_owners")
    .select("id, child_company_id, co_parent_company_id")
    .eq("group_id", groupId)
    .eq("status", "confirmed");

  return (data ?? []).map((row) => ({
    id: row.id as string,
    childId: row.child_company_id as string,
    coParentId: row.co_parent_company_id as string,
  }));
}

async function loadGroupMembers(groupId: string): Promise<MemberRow[]> {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("company_group_members")
    .select(
      "parent_company_id, company:companies!company_id(id, slug, name, category, city, country, claimed, verified, logo_url, website, logo_source)",
    )
    .eq("group_id", groupId)
    .eq("status", "confirmed");

  return (memberships ?? [])
    .map((m) => {
      const c = m.company as
        | (CompanyRow & { country: string | null })
        | (CompanyRow & { country: string | null })[]
        | null;
      const row = Array.isArray(c) ? c[0] : c;
      if (!row) return null;
      return {
        ...row,
        parentCompanyId: (m.parent_company_id as string | null) ?? null,
      };
    })
    .filter(Boolean) as MemberRow[];
}

async function attachPartnersAndClients(
  memberIds: string[],
  memberIdSet: Set<string>,
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  seen: Set<string>,
) {
  const [partnerMap, clientMap] = await Promise.all([
    acceptedPartnershipsForMany(memberIds),
    confirmedClientsForMany(memberIds),
  ]);

  const missingIds = new Set<string>();
  for (const id of memberIds) {
    for (const link of partnerMap.get(id) ?? []) {
      if (!seen.has(`company:${link.partnerId}`)) missingIds.add(link.partnerId);
    }
    for (const c of clientMap.get(id) ?? []) {
      if (!seen.has(`company:${c.id}`)) missingIds.add(c.id);
    }
  }

  const companyCache = await fetchCompaniesByIds([...missingIds]);

  // Pass 1 (sync, no awaits): decide each missing id's node "kind" using the
  // EXACT same first-occurrence-wins order as the original sequential loop
  // (partners before clients, member by member) — without doing any DB work
  // yet, so the ordering logic stays correct while the slow part (trust
  // profile lookups inside companyNode) can run in parallel below.
  const kindById = new Map<string, NetworkNodeKind>();
  const resolvedIds = new Set<string>(seen);
  for (const memberId of memberIds) {
    for (const link of partnerMap.get(memberId) ?? []) {
      const targetId = `company:${link.partnerId}`;
      if (resolvedIds.has(targetId)) continue;
      resolvedIds.add(targetId);
      kindById.set(
        link.partnerId,
        memberIdSet.has(link.partnerId) ? "company" : "partner",
      );
    }
    for (const client of clientMap.get(memberId) ?? []) {
      const targetId = `company:${client.id}`;
      if (resolvedIds.has(targetId)) continue;
      resolvedIds.add(targetId);
      kindById.set(
        client.id,
        memberIdSet.has(client.id) ? "company" : "client",
      );
    }
  }

  // Pass 2 (parallel): build every missing node's data at once instead of
  // one round-trip at a time.
  const builtNodes = await Promise.all(
    [...kindById.entries()].map(async ([id, kind]) => {
      const row = companyCache.get(id);
      if (!row) return null;
      return companyNode(row, kind);
    }),
  );
  for (const node of builtNodes) {
    if (!node) continue;
    nodes.push(node);
    seen.add(node.id);
  }

  // Pass 3 (sync): edges only — no awaits, cheap.
  const partnerEdgeSeen = new Set<string>();
  for (const memberId of memberIds) {
    const sourceId = `company:${memberId}`;

    for (const link of partnerMap.get(memberId) ?? []) {
      if (partnerEdgeSeen.has(link.partnershipId)) continue;
      partnerEdgeSeen.add(link.partnershipId);
      edges.push(
        edge("partner", sourceId, `company:${link.partnerId}`, {
          detachable: true,
          meta: {
            partnershipId: link.partnershipId,
            label: "Partnership",
          },
        }),
      );
    }

    for (const client of clientMap.get(memberId) ?? []) {
      edges.push(
        edge("client", sourceId, `company:${client.id}`, {
          detachable: false,
          meta: { label: "Client (confirmed reference)" },
        }),
      );
    }
  }
}

async function buildGroupGraph(
  group: {
    id: string;
    name: string;
    slug: string;
    website?: string | null;
    logo_url?: string | null;
    logo_source?: string | null;
    created_by?: string | null;
  },
  members: MemberRow[],
): Promise<NetworkGraph> {
  const countryCount = new Set(
    members.map((m) => m.country).filter(Boolean),
  ).size;

  const hubId = `group:${group.id}`;
  const nodes: NetworkNode[] = [
    {
      id: hubId,
      data: {
        slug: group.slug,
        name: group.name,
        logoInitials: initials(group.name),
        logoUrl: companyDisplayLogoUrl({
          logoUrl: group.logo_url,
          website: group.website,
        }),
        website: group.website ?? null,
        logoSource: group.logo_source ?? null,
        category: "Group",
        city: "",
        trustLevel: null,
        kind: "group",
        stats: {
          confirmedPartners: 0,
          confirmedReferences: 0,
          companyCount: members.length,
          countryCount,
        },
        href: `/g/${group.slug}`,
      },
    },
  ];
  const edges: NetworkEdge[] = [];
  const seen = new Set<string>([hubId]);
  const memberIdSet = new Set(members.map((m) => m.id));

  // Members are unique by id — safe to build every node in parallel instead
  // of one trust-profile round-trip at a time.
  const memberNodes = await Promise.all(
    members.map((member) =>
      companyNode(
        member,
        member.parentCompanyId ? "subsidiary" : "company",
      ),
    ),
  );

  members.forEach((member, i) => {
    const node = memberNodes[i];
    if (!seen.has(node.id)) {
      nodes.push(node);
      seen.add(node.id);
    }

    if (member.parentCompanyId && memberIdSet.has(member.parentCompanyId)) {
      edges.push(
        edge("subsidiary", `company:${member.parentCompanyId}`, node.id, {
          detachable: true,
          meta: {
            groupId: group.id,
            memberCompanyId: member.id,
            label: "Subsidiary",
          },
        }),
      );
    } else {
      edges.push(
        edge("member_of", hubId, node.id, {
          detachable: true,
          meta: {
            groupId: group.id,
            memberCompanyId: member.id,
            label: "Group membership",
          },
        }),
      );
    }
  });

  await attachPartnersAndClients(
    members.map((m) => m.id),
    memberIdSet,
    nodes,
    edges,
    seen,
  );

  // Shared ownership (joint ventures): child renders once, an extra "Owns"
  // edge is drawn from each confirmed co-parent — additive, never repositions
  // the child or duplicates the node.
  const coOwners = await loadConfirmedCoOwners(group.id);
  for (const link of coOwners) {
    const childId = `company:${link.childId}`;
    const parentId = `company:${link.coParentId}`;
    if (!seen.has(childId) || !seen.has(parentId)) continue;
    edges.push(
      edge("co_owner", parentId, childId, {
        detachable: true,
        meta: {
          groupId: group.id,
          memberCompanyId: link.childId,
          coOwnerId: link.id,
          label: "Shared ownership",
        },
      }),
    );
  }

  return trimGraph(nodes, edges, hubId, {
    groupId: group.id,
    groupSlug: group.slug,
    groupCreatedBy: group.created_by ?? null,
  });
}

type GroupHub = {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  logo_url?: string | null;
  logo_source?: string | null;
  created_by?: string | null;
};

async function buildLocalCompanyGraph(
  company: CompanyRow,
  options: {
    descendants: MemberRow[];
    parent: CompanyRow | null;
    group: GroupHub | null;
  },
): Promise<NetworkGraph> {
  const hub = await companyNode(company, "company");
  const nodes: NetworkNode[] = [hub];
  const edges: NetworkEdge[] = [];
  const seen = new Set<string>([hub.id]);
  const memberIdSet = new Set<string>([
    company.id,
    ...options.descendants.map((d) => d.id),
  ]);

  if (options.group) {
    const groupId = `group:${options.group.id}`;
    nodes.push({
      id: groupId,
      data: {
        slug: options.group.slug,
        name: options.group.name,
        logoInitials: initials(options.group.name),
        logoUrl: companyDisplayLogoUrl({
          logoUrl: options.group.logo_url,
          website: options.group.website,
        }),
        website: options.group.website ?? null,
        logoSource: options.group.logo_source ?? null,
        category: "Group",
        city: "",
        trustLevel: null,
        kind: "group",
        stats: {
          confirmedPartners: 0,
          confirmedReferences: 0,
        },
        href: `/g/${options.group.slug}`,
      },
    });
    seen.add(groupId);
    edges.push(
      edge("member_of", groupId, hub.id, {
        detachable: true,
        meta: {
          groupId: options.group.id,
          memberCompanyId: company.id,
          label: "Group membership",
        },
      }),
    );
  }

  if (options.parent && options.group) {
    const parentNode = await companyNode(options.parent, "company");
    if (!seen.has(parentNode.id)) {
      nodes.push(parentNode);
      seen.add(parentNode.id);
    }
    edges.push(
      edge("subsidiary", parentNode.id, hub.id, {
        detachable: true,
        meta: {
          groupId: options.group.id,
          memberCompanyId: company.id,
          label: "Subsidiary",
        },
      }),
    );
  }

  // Build every descendant node in parallel first (each is unique) — then a
  // fast, sync pass for edges, which still needs to run in list order since
  // it resolves each child's parent against the progressively-growing
  // `seen` set (a parent may itself be an earlier descendant in this list).
  const descendantNodes = await Promise.all(
    options.descendants.map((child) => companyNode(child, "subsidiary")),
  );

  options.descendants.forEach((child, i) => {
    const node = descendantNodes[i];
    if (!seen.has(node.id)) {
      nodes.push(node);
      seen.add(node.id);
    }
    const parentId = child.parentCompanyId
      ? `company:${child.parentCompanyId}`
      : hub.id;
    const source = seen.has(parentId) ? parentId : hub.id;
    edges.push(
      edge("subsidiary", source, node.id, {
        detachable: Boolean(options.group),
        meta: options.group
          ? {
              groupId: options.group.id,
              memberCompanyId: child.id,
              label: "Subsidiary",
            }
          : undefined,
      }),
    );
  });

  await attachPartnersAndClients(
    [company.id, ...options.descendants.map((d) => d.id)],
    memberIdSet,
    nodes,
    edges,
    seen,
  );

  return trimGraph(nodes, edges, hub.id, {
    groupId: options.group?.id ?? null,
    groupCreatedBy: options.group?.created_by ?? null,
    groupSlug: options.group?.slug ?? null,
    viewerCompanyId: company.id,
  });
}

function collectDescendants(
  rootId: string,
  members: MemberRow[],
): MemberRow[] {
  const byParent = new Map<string, MemberRow[]>();
  for (const m of members) {
    if (!m.parentCompanyId) continue;
    const list = byParent.get(m.parentCompanyId) ?? [];
    list.push(m);
    byParent.set(m.parentCompanyId, list);
  }

  const out: MemberRow[] = [];
  const stack = [...(byParent.get(rootId) ?? [])];
  const visited = new Set<string>();
  while (stack.length) {
    const next = stack.pop()!;
    if (visited.has(next.id)) continue;
    visited.add(next.id);
    out.push(next);
    stack.push(...(byParent.get(next.id) ?? []));
  }
  return out;
}

/** Attach public team counts/avatars (no names) to company nodes. */
async function withPublicTeamPreviews(graph: NetworkGraph): Promise<NetworkGraph> {
  const companyIds = [
    ...new Set(
      graph.nodes
        .filter((n) => n.data.companyId && !n.data.moreCount)
        .map((n) => n.data.companyId as string),
    ),
  ];

  if (companyIds.length === 0) return graph;

  const previews = await Promise.all(
    companyIds.map(async (id) => {
      const team = await getPublicTeam(id);
      return {
        id,
        count: team.length,
        avatars: team.slice(0, 3).map((m) => ({
          photoUrl: m.photoUrl,
          initials: initialsFromName(m.displayName),
        })),
      };
    }),
  );
  const byId = new Map(previews.map((p) => [p.id, p]));

  return {
    ...graph,
    nodes: graph.nodes.map((n) => {
      const id = n.data.companyId;
      if (!id || n.data.moreCount) return n;
      const p = byId.get(id);
      if (!p || p.count === 0) return n;
      return {
        ...n,
        data: {
          ...n.data,
          publicTeamCount: p.count,
          publicTeamAvatars: p.avatars,
        },
      };
    }),
  };
}

export async function getNetworkGraph(
  scope: NetworkScope,
  opts?: { viewerCompanyId?: string | null },
): Promise<NetworkGraph> {
  try {
    const raw =
      scope.type === "group"
        ? await graphForGroup(scope.slug)
        : await graphForCompany(scope.slug, scope.expand ?? "full");

    const graph = await withPublicTeamPreviews(raw);

    let isGroupCreator = false;
    if (graph.context?.groupCreatedBy) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isGroupCreator = Boolean(
        user && user.id === graph.context.groupCreatedBy,
      );
    }

    if (opts?.viewerCompanyId || isGroupCreator) {
      return {
        ...graph,
        context: {
          ...graph.context,
          viewerCompanyId: opts?.viewerCompanyId ?? null,
          isGroupCreator,
        },
      };
    }
    return graph;
  } catch {
    return { nodes: [], edges: [], summary: emptySummary() };
  }
}

/**
 * Prefer the group graph for the main workspace account (group creator
 * or any owned company that sits in a group).
 */
export async function resolveWorkspaceGraphScope(input: {
  companySlug: string;
  groupSlug?: string | null;
}): Promise<NetworkScope> {
  if (input.groupSlug) {
    return { type: "group", slug: input.groupSlug };
  }
  return { type: "company", slug: input.companySlug, expand: "full" };
}

async function graphForGroup(slug: string): Promise<NetworkGraph> {
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("company_groups")
    .select("id, name, slug, website, logo_url, logo_source, created_by")
    .eq("slug", slug)
    .maybeSingle();
  if (!group) return { nodes: [], edges: [], summary: emptySummary() };

  const members = await loadGroupMembers(group.id);
  return buildGroupGraph(group, members);
}

async function graphForCompany(
  slug: string,
  expand: "local" | "full",
): Promise<NetworkGraph> {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select(
      "id, slug, name, category, city, claimed, verified, logo_url, website, logo_source",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!company) return { nodes: [], edges: [], summary: emptySummary() };

  const { data: membership } = await supabase
    .from("company_group_members")
    .select(
      "parent_company_id, group:company_groups!group_id(id, name, slug, website, logo_url, logo_source, created_by)",
    )
    .eq("company_id", company.id)
    .eq("status", "confirmed")
    .limit(1)
    .maybeSingle();

  const groupRaw = membership?.group;
  const group = groupRaw
    ? Array.isArray(groupRaw)
      ? groupRaw[0]
      : groupRaw
    : null;

  if (group && expand === "full") {
    const members = await loadGroupMembers(group.id);
    return buildGroupGraph(group, members);
  }

  let descendants: MemberRow[] = [];
  let parent: CompanyRow | null = null;

  if (group) {
    const members = await loadGroupMembers(group.id);
    descendants = collectDescendants(company.id, members);
    const parentId = (membership?.parent_company_id as string | null) ?? null;
    if (parentId) {
      const map = await fetchCompaniesByIds([parentId]);
      parent = map.get(parentId) ?? null;
    }
  }

  return buildLocalCompanyGraph(company, {
    descendants,
    parent,
    group: group
      ? { id: group.id, name: group.name, slug: group.slug }
      : null,
  });
}
