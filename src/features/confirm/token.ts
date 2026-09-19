const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Confirm links are UUID tokens. Anything else must not hit the RPC. */
export function parseConfirmToken(raw: string): string | null {
  const token = raw.trim();
  return UUID.test(token) ? token : null;
}
