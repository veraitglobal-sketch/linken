"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
};

export function AddPartnerButton({ companySlug }: Props) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="plus"
      className="h-9 w-9 shrink-0 rounded-[3px] px-0 text-xl font-normal leading-none"
      aria-label="Add partner"
      title="Search and invite a partner"
      onClick={() => router.push(`/dashboard/partners?from=${companySlug}`)}
    >
      +
    </Button>
  );
}
