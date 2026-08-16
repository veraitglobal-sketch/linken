/** True when this org uses the partner workspace (not the company shell). */
export function isDeveloperPartnerKind(
  kind: string | null | undefined,
): boolean {
  return kind === "developer_partner";
}
