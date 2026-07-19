import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import type { Partner } from "@/types/partner";

type Props = {
  partner: Partner;
};

export function PartnerCard({ partner }: Props) {
  return (
    <Link
      href={`/c/${partner.slug}`}
      className="block px-2 py-3 transition-colors hover:bg-paper"
    >
      <div className="flex items-start gap-3">
        <LogoMark initials={partner.logoInitials} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {partner.name}
            {partner.verified ? (
              <span className="ml-1.5 text-[11px] font-medium text-success">
                Verified
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[12px] text-muted">
            {partner.category} · {partner.city}
          </p>
          {partner.sharedProjects > 0 ? (
            <p className="mt-1.5 text-[12px] text-ink-soft">
              {partner.sharedProjects} shared case studies
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
