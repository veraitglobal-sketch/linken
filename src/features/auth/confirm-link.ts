/** Browser URL for a hashed signup token. Origin is the auth site, never supabase.co. */
export function signupConfirmUrl(
  origin: string,
  tokenHash: string,
  type: string,
  next: string,
) {
  const q = new URLSearchParams({
    token_hash: tokenHash,
    type,
    next,
  });
  return `${origin.replace(/\/$/, "")}/auth/confirm?${q.toString()}`;
}
