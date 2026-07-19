import { AddPartnerButton } from "@/components/partners/add-partner-button";
import { PartnerCard } from "@/components/partners/partner-card";
import type { Partner } from "@/types/partner";

type Props = {
  companySlug: string;
  partners: Partner[];
  editable?: boolean;
};

export function PartnerSidebar({
  companySlug,
  partners,
  editable = false,
}: Props) {
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="border border-line bg-surface">
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
              Project network
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold tracking-[-0.02em] text-ink">
              Verified partners
            </h2>
          </div>
          {editable ? <AddPartnerButton companySlug={companySlug} /> : null}
        </div>
        <p className="border-b border-line px-4 py-3 text-[12px] leading-relaxed text-muted">
          Shown only after mutual confirmation. Linked to shared case studies.
        </p>
        <div className="px-2 py-1">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
        <div className="border-t border-line px-4 py-3">
          <a
            href={`/c/${companySlug}/partners`}
            className="text-[13px] font-medium text-accent hover:underline"
          >
            View full network
          </a>
        </div>
      </div>
    </aside>
  );
}
