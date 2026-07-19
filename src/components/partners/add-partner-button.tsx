"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  tone?: "default" | "onDark";
};

export function AddPartnerButton({
  companySlug,
  tone = "default",
}: Props) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={tone === "onDark" ? "onDark" : "plus"}
      className="h-9 w-9 shrink-0 rounded-xl px-0 text-xl font-normal leading-none"
      aria-label="Add partner"
      title="Search and invite a partner"
      onClick={() => router.push(`/dashboard/partners?from=${companySlug}`)}
    >
      +
    </Button>
  );
}
