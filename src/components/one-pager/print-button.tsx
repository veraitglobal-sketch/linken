"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      className="h-10 print:hidden"
      onClick={() => window.print()}
    >
      Download PDF
    </Button>
  );
}
