import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PartnerFlash({
  children,
  tone = "ok",
}: {
  children: ReactNode;
  tone?: "ok" | "error" | "warn";
}) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-4 py-3 text-[13px]",
        tone === "error"
          ? "border-ember/30 bg-ember/10 font-medium text-ink"
          : tone === "warn"
            ? "border-line bg-paper text-ink"
            : "border-line bg-surface text-ink",
      )}
    >
      {children}
    </p>
  );
}
