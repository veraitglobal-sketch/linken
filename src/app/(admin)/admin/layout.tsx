import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { email, role } = await requirePlatformStaff("support");

  return <AdminShell email={email} role={role}>{children}</AdminShell>;
}
