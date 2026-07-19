"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  companyName: string;
};

export function PartnerInviteButton({ companyName }: Props) {
  const [sent, setSent] = useState(false);

  return (
    <Button
      type="button"
      variant="plus"
      className="h-9 w-9 shrink-0 px-0 text-lg leading-none"
      aria-label={sent ? `Request sent to ${companyName}` : `Invite ${companyName}`}
      title={sent ? "Request sent" : "Send partnership request"}
      disabled={sent}
      onClick={() => setSent(true)}
    >
      {sent ? "✓" : "+"}
    </Button>
  );
}
