"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { startOfferCheckout } from "@/features/billing/offer-actions";
import type { OfferSku } from "@/features/billing/offer";

function Submit({ label, dark }: { label: string; dark?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={dark ? "light" : "primary"}
      className="h-11 w-full sm:w-auto sm:min-w-[220px]"
      disabled={pending}
    >
      {pending ? "Redirecting to checkout…" : label}
    </Button>
  );
}

export function OfferBuyForm({
  sku,
  ready,
}: {
  sku: OfferSku;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <Button
        href="/contact"
        variant={sku.recommended ? "light" : "secondary"}
        className="h-11 w-full sm:w-auto sm:min-w-[220px]"
      >
        Contact us to buy
      </Button>
    );
  }

  return (
    <form action={startOfferCheckout}>
      <input type="hidden" name="offer" value={sku.id} />
      <Submit label={sku.cta} dark={sku.recommended} />
    </form>
  );
}