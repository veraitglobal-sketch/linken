import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requirePlatformAdmin } from "@/features/admin/require-platform-admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requirePlatformAdmin();

  return (
    <AdminShell email={user.email ?? "admin"}>{children}</AdminShell>
  );
}
