"use client";

import { useState } from "react";
import { EndPartnershipButton } from "@/components/partners/end-partnership-button";

type Props = {
  partnershipId: string;
  back: string;
};

/** Discrete ⋯ menu for ending a partnership on the owner’s profile rail. */
export function PartnerManageMenu({ partnershipId, back }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Manage partnership"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
      >
        <span aria-hidden className="text-[16px] leading-none">
          ⋯
        </span>
      </button>
      {open ? (
        <div className="absolute top-8 right-0 z-20 min-w-[11rem] rounded-xl border border-line bg-white p-2 shadow-[0_12px_30px_rgba(10,20,18,0.12)]">
          <EndPartnershipButton
            partnershipId={partnershipId}
            back={back}
            label="End partnership"
          />
        </div>
      ) : null}
    </div>
  );
}
