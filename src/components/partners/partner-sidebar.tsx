import Link from "next/link";
import { AddPartnerButton } from "@/components/partners/add-partner-button";
import { PartnerCard } from "@/components/partners/partner-card";
import type { Partner } from "@/types/partner";

type Props = {
  companySlug: string;
  partners: Partner[];
  editable?: boolean;
};

const PREVIEW = 4;

export function PartnerSidebar({
  companySlug,
  partners,
  editable = false,
}: Props) {
  if (partners.length === 0 && !editable) return null;

  const preview = partners.slice(0, PREVIEW);
  const remaining = Math.max(partners.length - PREVIEW, 0);

  return (
    <aside id="partners" className="scroll-mt-24 lg:sticky lg:top-20 lg:self-start">
      <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_18px_50px_rgba(10,20,18,0.06)]">
        <div className="mesh-stage relative px-5 py-6 text-white">
          <div className="stage-grain absolute inset-0 opacity-60" />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-white/55 uppercase">
                Network{partners.length > 0 ? ` · ${partners.length}` : ""}
              </p>
              <h2 className="mt-2 font-display text-[1.45rem] font-medium tracking-[-0.03em]">
                Verified partners
              </h2>
              <p className="mt-2 max-w-[220px] text-[12px] leading-relaxed text-white/60">
                Listed only after both companies confirm.
              </p>
            </div>
            {editable ? (
              <AddPartnerButton companySlug={companySlug} tone="onDark" />
            ) : null}
          </div>
        </div>

        {preview.length > 0 ? (
          <div className="space-y-2 px-3.5 py-3.5">
            {preview.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-5">
            <p className="text-[13px] text-ink-soft">No confirmed partners yet.</p>
            <Link
              href={`/dashboard/partners?from=${companySlug}`}
              className="mt-2 inline-block text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
            >
              Invite a partner
            </Link>
          </div>
        )}

        {partners.length > 0 ? (
          <div className="border-t border-line px-5 py-4">
            <Link
              href={`/c/${companySlug}/partners`}
              className="text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
            >
              {remaining > 0
                ? `View all ${partners.length} partners`
                : "View full network"}
            </Link>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
