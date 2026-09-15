export const RELATIONSHIP_KINDS = [
  {
    id: "partner",
    label: "Partner",
    confirm: "They confirm. Then it is public.",
    body: "We work together — equals.",
  },
  {
    id: "client",
    label: "Client",
    confirm: "They confirm. You cannot mark it yourself.",
    body: "We delivered work for them.",
  },
  {
    id: "branch",
    label: "Branch",
    confirm: "Same owner — live on the map now.",
    body: "A daughter company you own.",
  },
  {
    id: "joint",
    label: "Joint company",
    confirm: "They confirm. Then both of you can open the firm.",
    body: "Two owners. e.g. 50 / 50.",
  },
] as const;

export type RelationshipKind = (typeof RELATIONSHIP_KINDS)[number]["id"];

export function parseRelationshipKind(raw: string | undefined): RelationshipKind | null {
  if (!raw) return null;
  return RELATIONSHIP_KINDS.some((k) => k.id === raw)
    ? (raw as RelationshipKind)
    : null;
}
