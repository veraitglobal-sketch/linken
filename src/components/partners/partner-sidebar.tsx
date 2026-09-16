import Link from "next/link";
import {
  AddPartnerButton,
  AddPartnerTextLink,
} from "@/components/partners/add-partner-button";
import { CompanyAddPartner } from "@/components/partners/company-add-partner";
import { PartnerRailList } from "@/components/partners/partner-rail-list";
import type { PartnerRailSettings } from "@/features/partners/partner-rail";
import { PRODUCT } from "@/lib/product-model";
import type { Company } from "@/types/company";
import type { Partner } from "@/types/partner";

type Props = {
  companySlug: string;
  partners: Partner[];
  rail: PartnerRailSettings;
  editable?: boolean;
  showAdd?: boolean;
  addQ?: string;
  addResults?: Company[];
  verified?: boolean;
  statusBySlug?: Map<string, string>;
  addMode?: "search" | "draft";
};

export function PartnerSidebar({
  companySlug,
  partners,
  rail,
  editable = false,
  showAdd = false,
  addQ = "",
  addResults = [],
  verified = false,
  statusBySlug = new Map(),
  addMode = "search",
}: Props) {
  if (partners.length === 0 && !editable) return null;

  return (
    /* `w-full`, not `lg:self-start`.
       The column is `flex flex-col`, and in a column flex container
       `align-self` governs the cross axis — the width. `self-start` therefore
       stopped this card stretching and shrank it to its content: 282px inside a
       320px column, 38 narrower than the "Why this level" card directly above
       it in the same column. It was there for `position: sticky`, which in a
       column does not depend on `align-self` at all. */
    <aside id="partners" className="w-full scroll-mt-24 lg:sticky lg:top-20">
      <div className="overflow-hidden rounded-[24px] bg-surface ring-1 ring-line/70">
        <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-lime-soft text-navy">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <circle cx="3.8" cy="8" r="2" />
                  <circle cx="12.2" cy="8" r="2" />
                  <path d="M5.8 8h4.4" />
                </svg>
              </span>
              <h2 className="font-display text-[16px] leading-tight font-semibold tracking-[-0.03em] text-ink">
                Verified partners
              </h2>
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-wash px-2 text-[12px] font-semibold text-ink tabular-nums">
                {partners.length}
              </span>
            </div>
            {editable ? <AddPartnerButton companySlug={companySlug} /> : null}
          </div>
          {editable ? (
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              {PRODUCT.partners.job}
            </p>
          ) : null}
        </div>

        {partners.length > 0 ? (
          <PartnerRailList
            companySlug={companySlug}
            partners={partners}
            rail={rail}
            editable={editable}
          />
        ) : (
          <div className="px-5 py-5">
            <p className="text-[13px] text-muted">
              No partners yet. Invite here — they show on {PRODUCT.map.label}{" "}
              after they accept.
            </p>
            {editable && !showAdd ? (
              <AddPartnerTextLink companySlug={companySlug} />
            ) : null}
          </div>
        )}

        {editable && showAdd ? (
          <CompanyAddPartner
            companySlug={companySlug}
            q={addQ}
            results={addResults}
            verified={verified}
            statusBySlug={statusBySlug}
            mode={addMode}
          />
        ) : null}

        {partners.length > 0 ? (
          <div className="border-t border-line/70 px-4 py-3.5 sm:px-5">
            <Link
              href={`/c/${companySlug}#network-map`}
              className="text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
            >
              View on {PRODUCT.map.label}
            </Link>
            <span className="mx-2 text-plus">·</span>
            <Link
              href={`/c/${companySlug}/partners`}
              className="text-[13px] font-semibold text-muted underline-offset-4 hover:underline"
            >
              Full list
            </Link>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
