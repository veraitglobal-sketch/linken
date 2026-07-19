"use client";

import { LogoTile } from "@/components/ui/logo-tile";
import { cn } from "@/lib/cn";

type Props = {
  initials: string;
  logoUrl?: string | null;
  website?: string | null;
  name?: string;
  className?: string;
};

/** Profile / partner slot — thin wrapper over shared LogoTile. */
export function PartnerMark({
  initials,
  logoUrl,
  website,
  name,
  className,
}: Props) {
  return (
    <LogoTile
      name={name ?? initials}
      initials={initials}
      logoUrl={logoUrl}
      website={website}
      size="md"
      className={cn("shrink-0", className)}
    />
  );
}
