/** Public listing: hidden and merge-loser rows are no_file. */
export function listedCompanies<Q extends { is: (column: string, value: null) => Q }>(
  query: Q,
): Q {
  return query.is("staff_hidden_at", null).is("merged_into_company_id", null);
}
