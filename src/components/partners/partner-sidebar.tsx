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
      <div className="overflow-hidden rounded-none border border-line bg-surface shadow-[0_18px_50px_rgba(10,20,18,0.06)]">
        <div className="mesh-stage relative px-5 py-3.5 text-white">
          <div className="stage-grain absolute inset-0 opacity-60" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="font-display text-[1.1rem] font-medium tracking-[-0.03em]">
                Verified partners
              </h2>
              <p className="text-[11px] font-semibold tracking-[0.1em] text-white/50 uppercase">
                {partners.length}
              </p>
            </div>
            {editable ? (
              <AddPartnerButton companySlug={companySlug} tone="onDark" />
            ) : null}
          </div>
          {editable ? (
            <p className="relative z-10 mt-1.5 text-[12px] leading-relaxed text-white/55">
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
          <div className="border-t border-line px-5 py-4">
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
