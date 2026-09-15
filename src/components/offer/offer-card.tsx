import { OfferBuyForm } from "@/components/offer/offer-buy-form";
import { NetworkMark } from "@/components/marketing/network-mark";
import { OFFER_INCLUDED, type OfferSku } from "@/features/billing/offer";
import { cn } from "@/lib/cn";

export function OfferCard({ sku, ready }: { sku: OfferSku; ready: boolean }) {
  const dark = Boolean(sku.recommended);

  return (
    <article
      className={cn(
        "flex flex-col rounded-[28px] p-7 sm:p-9",
        dark
          ? "bg-navy text-on-navy shadow-[0_30px_60px_-30px_rgba(14,31,28,0.55)] ring-[3px] ring-lime"
          : "bg-surface text-ink ring-1 ring-line/80",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-12 place-items-center rounded-2xl",
              dark ? "bg-lime text-navy" : "bg-navy text-lime",
            )}
          >
            <NetworkMark size={22} animate={false} />
          </span>
          <span className="font-display text-[28px] font-semibold tracking-[-0.03em]">
            {sku.name}
          </span>
        </div>
        {sku.recommended ? (
          <span className="mt-1.5 inline-flex h-8 items-center rounded-full bg-lime px-3.5 text-[12px] font-semibold text-navy">
            Best value
          </span>
        ) : null}
      </div>

      <p className={cn("mt-6 text-[18px] font-semibold", dark ? "text-on-navy" : "text-ink")}>
        {sku.audience}
      </p>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-[64px] leading-none font-semibold tracking-[-0.045em] tabular-nums">
          {sku.priceLabel}
        </p>
        <p className={cn("text-[15px]", dark ? "text-on-navy-muted" : "text-muted")}>
          <span className={cn("line-through", dark ? "decoration-white/50" : "decoration-ink/40")}>
            €79 / month
          </span>{" "}
          standard Pro
        </p>
      </div>

      {sku.saving ? (
        <p className="mt-4 inline-flex w-fit items-center rounded-full bg-lime/15 px-3 py-1 text-[14px] font-semibold text-lime ring-1 ring-lime/40">
          {sku.saving}
        </p>
      ) : null}
      <p className={cn("mt-4 text-[15px] leading-relaxed", dark ? "text-on-navy-soft" : "text-ink-soft")}>
        {sku.note}
      </p>

      <ul className={cn("mt-7 list-none space-y-3 border-t p-0 pt-7", dark ? "border-white/10" : "border-line")}>
        {OFFER_INCLUDED.map((f) => (
          <li key={f} className="flex gap-3 text-[15px] leading-relaxed">
            <span
              className={cn(
                "mt-[3px] grid size-5 shrink-0 place-items-center rounded-full text-navy",
                dark ? "bg-lime" : "bg-lime-soft",
              )}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="m2.5 6.5 2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={dark ? "text-on-navy" : "text-ink"}>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <OfferBuyForm sku={sku} ready={ready} />
      </div>
    </article>
  );
}
