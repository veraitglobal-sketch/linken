"use client";

import { useState } from "react";
import { BookSheet } from "@/components/scheduling/book-sheet";
import { Button } from "@/components/ui/button";
import type { SchedulingProvider } from "@/features/scheduling/types";

type Props = {
  companyName: string;
  logoInitials: string;
  logoUrl?: string | null;
  bookingUrl: string;
  provider: SchedulingProvider | null;
  label?: string;
  className?: string;
};

export function BookCallButton({
  companyName,
  logoInitials,
  logoUrl,
  bookingUrl,
  provider,
  label = "Book a call",
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="light"
        className={className ?? "h-11 min-w-[150px] px-5"}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <BookSheet
        open={open}
        onClose={() => setOpen(false)}
        companyName={companyName}
        logoInitials={logoInitials}
        logoUrl={logoUrl}
        bookingUrl={bookingUrl}
        provider={provider}
        label={label}
      />
    </>
  );
}
