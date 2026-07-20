"use client";

import { useState } from "react";
import { endPartnership } from "@/features/network/partnership-lifecycle";
import { Button } from "@/components/ui/button";

type Props = {
  partnershipId: string;
  back: string;
  label?: string;
  variant?: "ghost" | "secondary";
};

export function EndPartnershipButton({
  partnershipId,
  back,
  label = "End partnership",
  variant = "ghost",
}: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant={variant}
        className="h-8 px-3 text-[11px]"
        onClick={() => setConfirming(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <form
      action={endPartnership}
      className="flex max-w-xs flex-col gap-2 rounded-xl border border-line bg-white px-3 py-2.5"
    >
      <input type="hidden" name="partnership_id" value={partnershipId} />
      <input type="hidden" name="back" value={back} />
      <p className="text-[12px] leading-relaxed text-ink-soft">
        This removes the partnership from both profiles. Case study
        collaborations remain.
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Button type="submit" className="h-8 px-3 text-[11px]">
          Confirm end
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 px-3 text-[11px]"
          onClick={() => setConfirming(false)}
        >
          Keep
        </Button>
      </div>
    </form>
  );
}
