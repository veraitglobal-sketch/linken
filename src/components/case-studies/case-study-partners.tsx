import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import type { CaseStudyPartner } from "@/types/case-study";

type Props = {
  partners: CaseStudyPartner[];
};

export function CaseStudyPartners({ partners }: Props) {
  if (partners.length === 0) return null;

  return (
    <div className="mt-4">
      <ul className="flex flex-col gap-2">
        {partners.map((partner) => (
          <li key={partner.slug}>
            <Link
              href={`/c/${partner.slug}`}
              className="flex items-center gap-3 border border-line bg-paper px-3 py-2.5 transition-colors hover:border-line-strong"
            >
              <LogoMark initials={partner.logoInitials} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">
                  {partner.name}
                  {partner.confirmed ? (
                    <span className="ml-2 text-[11px] font-medium text-success">
                      Confirmed
                    </span>
                  ) : null}
                </span>
                <span className="block text-[12px] text-muted">{partner.role}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
