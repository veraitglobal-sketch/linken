"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  initials: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-9 w-9 text-[10px]",
  md: "h-11 w-11 text-[11px]",
  lg: "h-14 w-14 text-xs",
};

const imgPad = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
};

export function LogoMark({
  initials,
  logoUrl,
  size = "md",
  className,
}: Props) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(logoUrl) && !failed;

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line font-medium tracking-[0.08em] text-ink",
        showImg ? cn("bg-white", imgPad[size]) : "bg-paper",
        sizes[size],
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
        initials
      )}
    </div>
  );
}
