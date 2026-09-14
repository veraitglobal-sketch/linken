import { OfferBuyForm } from "@/components/offer/offer-buy-form";
import type { OfferSku } from "@/features/billing/offer";
import { PRO_HIGHLIGHTS } from "@/features/plan/pricing";
import { cn } from "@/lib/cn";

export function OfferCard({ sku, ready }: { sku: OfferSku; ready: boolean }) {
  const dark = Boolean(sku.recommended);

  return (
    <article
      className={cn(
        "flex flex-col rounded-[24px] p-7 sm:p-9",
        dark
          ? "bg-navy text-white shadow-[0_24px_60px_rgba(8,20,18,0.2)]"
          : "border border-line bg-surface",
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold tracking-[0.16em] uppercase",
          dark ? "text-white/55" : "text-blue",
        )}
      >
        {sku.recommended ? "Best value" : "Introductory"}
      </p>
      <h2
        className={cn(
          "mt-3 font-display text-[22px] font-medium tracking-[-0.025em]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {sku.name}
      </h2>
      <p
        className={cn(
          "mt-2 font-display text-[28px] font-medium tracking-[-0.03em]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {sku.priceLabel}
      </p>
      <p className={cn("mt-2 text-[13px]", dark ? "text-white/55" : "text-muted")}>
        {sku.cadence}
      </p>
      <p className={cn("mt-1 text-[13px]", dark ? "text-white/55" : "text-muted")}>
        {sku.effective}
      </p>
      <p className={cn("mt-1 text-[13px]", dark ? "text-white/45" : "text-plus")}>
        {sku.compare}
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {PRO_HIGHLIGHTS.map((f) => (
          <li
            key={f}
            className={cn(
              "flex gap-3 text-[13.5px] leading-relaxed",
              dark ? "text-white/75" : "text-ink-soft",
            )}
          >
            <span
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#7eb8a4]"
              aria-hidden
            />
            {f}
          </li>
        ))}
      </ul>
      <p className={cn("mt-4 text-[12px]", dark ? "text-white/45" : "text-muted")}>
        Renews at this price until canceled. Prices in US dollars.
      </p>
      <OfferBuyForm sku={sku} ready={ready} />
    </article>
  );
}