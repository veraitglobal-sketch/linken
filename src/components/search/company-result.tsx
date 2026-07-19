import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  action?: ReactNode;
};

export function CompanyResult({ company, action }: Props) {
  const unclaimed = company.claimed === false;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-3.5 py-3.5">
      <LogoMark initials={company.logoInitials} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/c/${company.slug}?src=search`}
            className="truncate font-display text-[15px] font-semibold tracking-[-0.02em] text-ink hover:text-accent"
          >
            {company.name}
          </Link>
          {unclaimed ? (
            <span className="rounded-md border border-ember/30 bg-ember/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-ember uppercase">
              Unclaimed
            </span>
          ) : company.verified ? (
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
