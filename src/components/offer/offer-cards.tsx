import { OfferCard } from "@/components/offer/offer-card";
import { OFFER_SKUS } from "@/features/billing/offer";
import { cn } from "@/lib/cn";

export function OfferCards({
  ready,
  className,
}: {
  ready: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-stretch gap-5",
        className,
      )}
    >
      {OFFER_SKUS.map((sku) => (
        <OfferCard key={sku.id} sku={sku} ready={ready} />
      ))}
    </div>
  );
}
