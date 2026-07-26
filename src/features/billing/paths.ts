export function billingBack(query?: string) {
  return `/dashboard/billing${query ? `?${query}` : ""}`;
}
