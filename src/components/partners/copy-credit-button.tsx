"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  snippet: string;
  label?: string;
};

export function CopyCreditButton({ snippet, label = "Copy credit" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="h-8 px-3 text-[11px]"
      onClick={copy}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}
