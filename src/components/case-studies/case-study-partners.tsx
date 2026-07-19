import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CaseStudyPartner } from "@/types/case-study";

type Props = {
  partners: CaseStudyPartner[];
  onDark?: boolean;
};

export function CaseStudyPartners({ partners, onDark = false }: Props) {
  const confirmed = partners.filter((p) => p.confirmed);
  if (confirmed.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {confirmed.map((partner) => (
        <Link
          key={partner.slug}
          href={`/c/${partner.slug}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors",
            onDark
              ? "border border-white/15 bg-white/10 text-white hover:bg-white/16"
              : "border border-line bg-[#f7f8fa] text-ink hover:border-[#10231f]/20 hover:bg-white",
          )}
        >
          <span className="font-medium">{partner.name}</span>
          <span className={onDark ? "text-white/50" : "text-muted"}>
            · {partner.role}
          </span>
        </Link>
      ))}
    </div>
  );
}
