"use client";

import { LogoTile } from "@/components/ui/logo-tile";
import { cn } from "@/lib/cn";

type Props = {
  initials: string;
  logoUrl?: string | null;
  name?: string;
  className?: string;
};

/** Partner / profile mark — real logo or initials, never favicon. */
export function PartnerMark({
  initials,
  logoUrl,
  name,
  className,
}: Props) {
  return (
    <LogoTile
      name={name ?? initials}
      initials={initials}
      logoUrl={logoUrl}
      size="md"
      className={cn("shrink-0", className)}
    />
  );
}
