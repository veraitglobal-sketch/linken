/** Display helpers for accrued commission amounts only. */

export function formatCommissionCents(
  cents: number,
  currency = "eur",
): string {
  const amount = (Number(cents) || 0) / 100;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}
