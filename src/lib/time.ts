/** Wall-clock helpers for server gates (suspensions, expiries). */

export function isTimestampInFuture(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return t > Date.now();
}
