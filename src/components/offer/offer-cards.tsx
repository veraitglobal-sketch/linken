import { OfferCard } from "@/components/offer/offer-card";
import { OFFER_SKUS } from "@/features/billing/offer";

export function OfferCards({ ready }: { ready: boolean }) {
  return (
    <div className="mt-11 grid items-stretch gap-4 lg:grid-cols-[1fr_1.06fr]">
      {OFFER_SKUS.map((sku) => (
        <OfferCard key={sku.id} sku={sku} ready={ready} />
      ))}
    </div>
  );
}