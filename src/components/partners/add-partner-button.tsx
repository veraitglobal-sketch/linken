"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  tone?: "default" | "onDark";
};

/** Stays on Company — opens the invite panel. */
export function AddPartnerButton({
  companySlug,
  tone = "default",
}: Props) {
  return (
    <Button
      href={`/c/${companySlug}?add=1#add-partner`}
      variant={tone === "onDark" ? "onDark" : "plus"}
      className="h-9 w-9 shrink-0 rounded-xl px-0 text-xl font-normal leading-none"
      aria-label="Add partner"
      title="Invite a partner on this page"
    >
      +
    </Button>
  );
}

export function AddPartnerTextLink({ companySlug }: { companySlug: string }) {
  return (
    <Link
      href={`/c/${companySlug}?add=1#add-partner`}
      className="mt-2 inline-block text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
    >
      Invite a partner
    </Link>
  );
}
