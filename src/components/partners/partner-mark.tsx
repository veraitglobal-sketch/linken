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
      /* `sm` (36px) rather than `md` (44). The rail is a list of many
         companies in a fixed column, and eight pixels of mark per row is three
         more partners visible before anyone scrolls. 36px still carries a real
         logo legibly — below that a wordmark starts to mush. */
      size="sm"
      className={cn("shrink-0", className)}
    />
  );
}
