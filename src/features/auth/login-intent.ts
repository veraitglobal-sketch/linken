/** True when login should send the user into platform admin, not a company workspace. */
export function isStaffLoginNext(next: string | undefined): boolean {
  if (!next) return false;
  const path = next.split("?")[0] ?? next;
  return path === "/admin" || path.startsWith("/admin/");
}
