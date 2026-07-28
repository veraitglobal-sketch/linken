import Link from "next/link";
import type { ReactNode } from "react";

type Props = { page: number; disabled: boolean; children: ReactNode };

export function AdminAuditPageLink({ page, disabled, children }: Props) {
  if (disabled) {
    return <span className="text-[12px] text-muted">{children}</span>;
  }
  return (
    <Link
      href={`/admin/audit?page=${page}`}
      className="text-[12px] font-semibold text-ember underline-offset-2 hover:underline"
    >
      {children}
    </Link>
  );
}
