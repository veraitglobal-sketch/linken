"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { dismissSetupGuidance } from "@/features/dashboard/dismiss-setup";

type Props = {
  companyId: string;
  nextLabel: string | null;
};

export function HomeSetupBanner({ companyId, nextLabel }: Props) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [pending, start] = useTransition();

  if (hidden) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#1a5c51]/25 bg-[#1a5c51]/08 px-4 py-3.5">
      <p className="text-[13px] leading-relaxed text-ink">
        <span className="font-semibold">Setup guide.</span>{" "}
        {nextLabel
          ? `Focus on: ${nextLabel}.`
          : "Finish the checklist to activate your first verified reference."}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          start(async () => {
            await dismissSetupGuidance(companyId);
            setHidden(true);
            router.refresh();
          });
        }}
        className="shrink-0 text-[12px] font-semibold text-ink underline-offset-2 hover:underline disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
