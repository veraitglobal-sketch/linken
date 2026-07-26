import "server-only";

import { createHash, randomBytes } from "crypto";

export const CALCOM_PKCE_COOKIE = "hansala_calcom_pkce";

export function createCalcomPkce(): {
  verifier: string;
  challenge: string;
} {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}
