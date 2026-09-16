/**
 * Ranking points — what puts a company above another in its category.
 *
 * Separate from `features/trust/score.ts`, which grades one profile on its own.
 * This one has to survive being competed over, so it answers three questions the
 * trust score does not need to:
 *
 * - Who confirmed it? A confirmation from a company that proved its domain is
 *   worth more than one from a company that did not.
 * - When? Work from four years ago is real, and it stays on the profile, but it
 *   should not hold first place against someone delivering now.
 * - How many different companies? Points from any single counterparty are
 *   capped, so two firms confirming each other in a loop cannot climb.
 *
 * Nothing here reads a plan. Position is not for sale.
 */

export type RankRecordKind =
  | "partner"
  | "reference"
  | "ongoing_reference"
  | "case_client"
  | "case_partner"
  | "testimonial";

export type RankRecord = {
  kind: RankRecordKind;
  /** The other company. Null when the counterparty has no profile yet. */
  counterpartyId: string | null;
  /** The counterparty proved it controls its domain. */
  counterpartyVerified: boolean;
  /** When it was confirmed. Null counts as the oldest bucket. */
  confirmedAt: string | Date | null;
  /** Testimonials only: attached to a confirmed record, and the author's address. */
  attached?: boolean;
  authorFreeMail?: boolean;
};

export type RankResult = {
  points: number;
  distinctPartners: number;
  confirmedRecords: number;
  lastConfirmedAt: string | null;
};

const BASE: Record<RankRecordKind, number> = {
  partner: 2,
  reference: 2,
  ongoing_reference: 3,
  case_client: 3,
  case_partner: 2,
  testimonial: 1,
};

/** Points from one counterparty, total, however many records they confirm. */
export const COUNTERPARTY_CAP = 6;
const UNVERIFIED_WEIGHT = 0.4;
const UNKNOWN_BUCKET = "unknown";

/** Decay by confirmation age. Stated in months so the steps are legible. */
export function recencyWeight(confirmedAt: string | Date | null, now = new Date()): number {
  if (!confirmedAt) return 0.25;
  const then = new Date(confirmedAt);
  if (Number.isNaN(then.getTime())) return 0.25;
  const months = (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months <= 12) return 1;
  if (months <= 24) return 0.7;
  if (months <= 36) return 0.45;
  return 0.25;
}

function value(record: RankRecord, now: Date): number {
  let base = BASE[record.kind];
  if (record.kind === "testimonial") {
    if (record.authorFreeMail) return 0;
    if (!record.attached) base = record.counterpartyVerified ? 0.25 : 0;
  }
  const verified = record.counterpartyVerified ? 1 : UNVERIFIED_WEIGHT;
  return base * verified * recencyWeight(record.confirmedAt, now);
}

/**
 * Points for one company. Records must already be confirmed — pending, declined
 * and disputed rows never reach here.
 */
export function computeRankPoints(records: RankRecord[], now = new Date()): RankResult {
  const perCounterparty = new Map<string, number>();
  const distinct = new Set<string>();
  let last = 0;

  // Highest-value records first, so a capped counterparty contributes its best.
  const sorted = [...records].sort((a, b) => value(b, now) - value(a, now));

  for (const record of sorted) {
    const bucket = record.counterpartyId ?? UNKNOWN_BUCKET;
    const used = perCounterparty.get(bucket) ?? 0;
    const room = Math.max(0, COUNTERPARTY_CAP - used);
    if (room > 0) {
      perCounterparty.set(bucket, used + Math.min(room, value(record, now)));
    }
    if (record.counterpartyId) distinct.add(record.counterpartyId);
    const at = record.confirmedAt ? new Date(record.confirmedAt).getTime() : 0;
    if (!Number.isNaN(at) && at > last) last = at;
  }

  const points = [...perCounterparty.values()].reduce((sum, v) => sum + v, 0);

  return {
    points: Math.round(points * 100) / 100,
    distinctPartners: distinct.size,
    confirmedRecords: records.length,
    lastConfirmedAt: last ? new Date(last).toISOString() : null,
  };
}

/** A list only shows positions once it is a real field. */
export const MIN_RANKED_FOR_POSITIONS = 5;
/** A category is worth its own page at this many ranked companies. */
export const MIN_RANKED_FOR_PAGE = 3;
