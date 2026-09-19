/**
 * Service-role listings must filter these columns — that client bypasses RLS.
 * Anon queries must not: `staff_hidden_at` is revoked from anon, and
 * `companies_public_read` already excludes hidden and merged rows.
 */
export function listedCompanies<Q extends { is: (column: string, value: null) => Q }>(
  query: Q,
): Q {
  return query.is("staff_hidden_at", null).is("merged_into_company_id", null);
}
