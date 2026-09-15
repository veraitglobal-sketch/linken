"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { startOfferCheckout } from "@/features/billing/offer-actions";
import type { OfferSku } from "@/features/billing/offer";
import { cn } from "@/lib/cn";

function buttonClass(dark?: boolean) {
  return cn(
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-colors disabled:opacity-60",
    dark
      ? "bg-lime text-navy hover:bg-[#bfe56c]"
      : "bg-navy text-on-navy hover:bg-navy-deep",
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Submit({ label, dark }: { label: string; dark?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClass(dark)} disabled={pending}>
      {pending ? "Redirecting to checkout…" : label}
      {pending ? null : <Arrow />}
    </button>
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
      <Link href="/contact" className={buttonClass(sku.recommended)}>
        Contact us to buy
        <Arrow />
      </Link>
    );
  }

  return (
    <form action={startOfferCheckout}>
      <input type="hidden" name="offer" value={sku.id} />
      <Submit label={sku.cta} dark={sku.recommended} />
    </form>
  );
}
