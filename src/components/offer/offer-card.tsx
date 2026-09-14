import { OfferBuyForm } from "@/components/offer/offer-buy-form";
import { OFFER_INCLUDED, type OfferSku } from "@/features/billing/offer";
import { cn } from "@/lib/cn";

export function OfferCard({ sku, ready }: { sku: OfferSku; ready: boolean }) {
  const dark = Boolean(sku.recommended);

  return (
    <article
      className={cn(
        "flex flex-col rounded-card p-7 sm:p-9",
        dark
          ? "border border-transparent bg-navy text-on-navy shadow-chapter"
          : "border border-line bg-surface shadow-[0_1px_2px_rgba(8,20,18,0.03)]",
      )}
    >
      <div className="flex min-h-[26px] items-center justify-between gap-4">
        <p
          className={cn(
            "font-label text-[11px] font-semibold tracking-[0.16em] uppercase",
            dark ? "text-blue-soft" : "text-blue",
          )}
        >
          {sku.name}
        </p>
        {sku.recommended ? (
          <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-on-navy-soft uppercase">
            Best value
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          "mt-4 font-display text-[44px] leading-none font-medium tracking-[-0.04em] tabular-nums",
          dark ? "text-on-navy" : "text-ink",
        )}
      >
        {sku.priceLabel}
      </p>
      <p
        className={cn(
          "mt-4 text-[13px] leading-relaxed",
          dark ? "text-on-navy-muted" : "text-muted",
        )}
      >
        {sku.note}
      </p>

      <ul className="mt-6 list-none space-y-3 p-0">
        {OFFER_INCLUDED.map((f) => (
          <li
            key={f}
            className={cn(
              "flex gap-3 text-[13.5px] leading-relaxed",
              dark ? "text-on-navy-soft" : "text-ink-soft",
            )}
          >
            <span
              className={cn(
                "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full",
                dark ? "bg-blue-soft" : "bg-blue",
              )}
              aria-hidden
            />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <OfferBuyForm sku={sku} ready={ready} />
      </div>
    </article>
  );
}