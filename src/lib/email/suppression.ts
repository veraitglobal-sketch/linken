import "server-only";

import { emailDomain } from "@/features/verification/domain";
import { createAdminClient } from "@/lib/supabase/admin";

/** True when `email` (address or its domain) is in email_suppressions. */
export async function isEmailSuppressed(email: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const address = email.trim().toLowerCase();
  if (!address) return false;
  const domain = emailDomain(address);

  const values = domain ? [address, domain] : [address];
  const { data } = await admin
    .from("email_suppressions")
    .select("kind, value")
    .in("value", values);

  if (!data || data.length === 0) return false;
  return data.some(
    (row) =>
      (row.kind === "address" && row.value === address) ||
      (row.kind === "domain" && row.value === domain),
  );
}
