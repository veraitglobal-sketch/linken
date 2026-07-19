"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  companyName: string;
};

export function RequestPartnerButton({ companyName }: Props) {
  const [sent, setSent] = useState(false);

  return (
    <Button
      type="button"
      variant="plus"
      className="h-9 shrink-0 px-3"
      disabled={sent}
      onClick={() => setSent(true)}
      aria-label={`Request partnership with ${companyName}`}
    >
      {sent ? "Requested" : "+ Request"}
    </Button>
  );
}
