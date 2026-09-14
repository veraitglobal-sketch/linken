import { OfferCard } from "@/components/offer/offer-card";
import { OFFER_SKUS } from "@/features/billing/offer";

export function OfferCards({ ready }: { ready: boolean }) {
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-2">
      {OFFER_SKUS.map((sku) => (
        <OfferCard key={sku.id} sku={sku} ready={ready} />
      ))}
    </div>
  );
}