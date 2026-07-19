"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  initials: string;
  logoUrl?: string | null;
  className?: string;
};

/** Profile slot for a partner firm — photo or mark. */
export function PartnerMark({ initials, logoUrl, className }: Props) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(logoUrl) && !failed;

  return (
    <div
      className={cn(
        "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl",
        showImg
          ? "bg-white p-1.5 shadow-[inset_0_0_0_1px_rgba(16,35,31,0.08)]"
          : "bg-[#10231f] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        className,
      )}
      aria-hidden
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl!}
          alt=""
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-display text-base font-medium tracking-[-0.03em]">
          {initials}
        </span>
      )}
    </div>
  );
}
