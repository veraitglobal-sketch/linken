import { getTrustProfile } from "@/features/trust/queries";
import type {
  NetworkEdge,
  NetworkGraph,
  NetworkNode,
  NetworkNodeData,
  NetworkScope,
} from "@/features/network/types";
import type { TrustLevel } from "@/features/trust/score";
import { createClient } from "@/lib/supabase/server";

const MAX_NODES = 60;

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
};

async function companyNode(
  row: CompanyRow,
  kind: "company" | "external",
): Promise<NetworkNode> {
  const trust = await getTrustProfile(row.id, row.slug);
  const data: NetworkNodeData = {
    slug: row.slug,
    name: row.name,
    logoInitials: initials(row.name),
    category: row.category ?? "",
    city: row.city ?? "",
    trustLevel: row.claimed === false ? null : trust.level,
    kind,
    stats: {
      confirmedPartners: trust.breakdown.confirmedPartners,
      confirmedReferences:
        trust.breakdown.confirmedReferences + trust.breakdown.ongoingReferences,
    },
    href: `/c/${row.slug}`,
  };
  return { id: `company:${row.id}`, data };
}

async function fetchCompany(id: string): Promise<CompanyRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id, slug, name, category, city, claimed")
    .eq("id", id)
    .maybeSingle();
  return data;
}

async function acceptedPartnerIds(companyId: string): Promise<string[]> {
  const supabase = await createClient();
  const [asReq, asRec] = await Promise.all([
    supabase
      .from("partnerships")
      .select("recipient_id")
      .eq("status", "accepted")
      .eq("requester_id", companyId),
    supabase
      .from("partnerships")
      .select("requester_id")
      .eq("status", "accepted")
      .eq("recipient_id", companyId),
  ]);
  const ids = [
    ...(asReq.data ?? []).map((r) => r.recipient_id as string),
    ...(asRec.data ?? []).map((r) => r.requester_id as string),
  ];
  return [...new Set(ids)];
}

async function confirmedClientCompanies(
  providerId: string,
): Promise<{ id: string; ongoing: boolean }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_references")
    .select("client_company_id, ongoing")
    .eq("provider_company_id", providerId)
    .eq("status", "confirmed")
    .not("client_company_id", "is", null);

  const map = new Map<string, boolean>();
  for (const row of data ?? []) {
    const id = row.client_company_id as string;
    if (!id) continue;
    map.set(id, map.get(id) === true || Boolean(row.ongoing));
  }
  return [...map.entries()].map(([id, ongoing]) => ({ id, ongoing }));
}

function edge(
  type: NetworkEdge["type"],
  source: string,
  target: string,
): NetworkEdge {
  return {
    id: `${type}:${source}->${target}`,
    source,
    target,
    type,
  };
}

function trimGraph(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  hubId: string,
): NetworkGraph {
  if (nodes.length <= MAX_NODES) return { nodes, edges };

  const keep = new Set<string>([hubId]);

  // Priority: member_of, then ongoing clients (via edge type client), then partners
  const memberEdges = edges.filter((e) => e.type === "member_of");
  const clientEdges = edges.filter((e) => e.type === "client");
  const partnerEdges = edges.filter((e) => e.type === "partner");

  for (const e of [...memberEdges, ...clientEdges, ...partnerEdges]) {
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
        category: "Network",
        city: "",
        trustLevel: null,
        kind: "external",
        stats: { confirmedPartners: 0, confirmedReferences: 0 },
        href: "#",
        moreCount: omitted,
      },
    });
  }

  const keptEdges = edges.filter(
    (e) => keep.has(e.source) && keep.has(e.target),
  );
  return { nodes: keptNodes, edges: keptEdges };
}

export async function getNetworkGraph(
  scope: NetworkScope,
): Promise<NetworkGraph> {
  try {
    if (scope.type === "group") {
      return await graphForGroup(scope.slug);
    }
    return await graphForCompany(scope.slug);
  } catch {
    return { nodes: [], edges: [] };
  }
}

async function graphForGroup(slug: string): Promise<NetworkGraph> {
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("company_groups")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!group) return { nodes: [], edges: [] };

  const { data: memberships } = await supabase
    .from("company_group_members")
    .select(
      "company:companies!company_id(id, slug, name, category, city, country, claimed)",
    )
    .eq("group_id", group.id)
    .eq("status", "confirmed");

  type MemberRow = CompanyRow & { country: string | null };
  const members = (memberships ?? [])
    .map((m) => {
      const c = m.company as MemberRow | MemberRow[] | null;
      return Array.isArray(c) ? c[0] : c;
    })
    .filter(Boolean) as MemberRow[];

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

  for (const member of members) {
    const node = await companyNode(member, "company");
    if (!seen.has(node.id)) {
      nodes.push(node);
      seen.add(node.id);
    }
    edges.push(edge("member_of", hubId, node.id));

    const partnerIds = await acceptedPartnerIds(member.id);
    for (const pid of partnerIds) {
      if (seen.has(`company:${pid}`)) {
        edges.push(edge("partner", node.id, `company:${pid}`));
        continue;
      }
      const row = await fetchCompany(pid);
      if (!row) continue;
      const pNode = await companyNode(row, "external");
      if (!seen.has(pNode.id)) {
        nodes.push(pNode);
        seen.add(pNode.id);
      }
      edges.push(edge("partner", node.id, pNode.id));
    }

    const clients = await confirmedClientCompanies(member.id);
    // Prefer ongoing first for later trim
    clients.sort((a, b) => Number(b.ongoing) - Number(a.ongoing));
    for (const client of clients) {
      if (seen.has(`company:${client.id}`)) {
        edges.push(edge("client", node.id, `company:${client.id}`));
        continue;
      }
      const row = await fetchCompany(client.id);
      if (!row) continue;
      const cNode = await companyNode(row, "external");
      if (!seen.has(cNode.id)) {
        nodes.push(cNode);
        seen.add(cNode.id);
      }
      edges.push(edge("client", node.id, cNode.id));
    }
  }

  return trimGraph(nodes, edges, hubId);
}

async function graphForCompany(slug: string): Promise<NetworkGraph> {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id, slug, name, category, city, claimed")
    .eq("slug", slug)
    .maybeSingle();
  if (!company) return { nodes: [], edges: [] };

  const hub = await companyNode(company, "company");
  const nodes: NetworkNode[] = [hub];
  const edges: NetworkEdge[] = [];
  const seen = new Set<string>([hub.id]);

  const { data: membership } = await supabase
    .from("company_group_members")
    .select("group:company_groups!group_id(id, name, slug)")
    .eq("company_id", company.id)
    .eq("status", "confirmed")
    .limit(1)
    .maybeSingle();

  if (membership?.group) {
    const g = Array.isArray(membership.group)
      ? membership.group[0]
      : membership.group;
    if (g) {
      const groupId = `group:${g.id}`;
      nodes.push({
        id: groupId,
        data: {
          slug: g.slug,
          name: g.name,
          logoInitials: initials(g.name),
          category: "Group",
          city: "",
          trustLevel: null as TrustLevel | null,
          kind: "group",
          stats: {
            confirmedPartners: 0,
            confirmedReferences: 0,
          },
          href: `/g/${g.slug}`,
        },
      });
      seen.add(groupId);
      edges.push(edge("member_of", groupId, hub.id));
    }
  }

  const partnerIds = await acceptedPartnerIds(company.id);
  for (const pid of partnerIds) {
    const row = await fetchCompany(pid);
    if (!row) continue;
    const pNode = await companyNode(row, "external");
    if (!seen.has(pNode.id)) {
      nodes.push(pNode);
      seen.add(pNode.id);
    }
    edges.push(edge("partner", hub.id, pNode.id));
  }

  const clients = await confirmedClientCompanies(company.id);
  clients.sort((a, b) => Number(b.ongoing) - Number(a.ongoing));
  for (const client of clients) {
    const row = await fetchCompany(client.id);
    if (!row) continue;
    const cNode = await companyNode(row, "external");
    if (!seen.has(cNode.id)) {
      nodes.push(cNode);
      seen.add(cNode.id);
    }
    edges.push(edge("client", hub.id, cNode.id));
  }

  return trimGraph(nodes, edges, hub.id);
}
