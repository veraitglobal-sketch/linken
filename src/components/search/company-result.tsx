import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  action?: ReactNode;
};

export function CompanyResult({ company, action }: Props) {
  return (
    <div className="flex items-center gap-3 border border-line bg-panel px-3.5 py-3.5">
      <LogoMark initials={company.logoInitials} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/c/${company.slug}`}
            className="truncate font-display text-[15px] font-semibold tracking-[-0.02em] text-ink hover:text-accent"
          >
            {company.name}
          </Link>
          {company.verified ? (
            <span className="text-[11px] font-semibold tracking-[0.12em] text-success uppercase">
              Verified
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[12px] text-muted">
          {company.category} · {company.city}
        </p>
      </div>
      {action}
    </div>
  );
}
