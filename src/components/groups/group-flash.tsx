import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GroupFlash({
  children,
  tone = "ok",
}: {
  children: ReactNode;
  tone?: "ok" | "error";
}) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-4 py-3 text-[13px]",
        tone === "error"
          ? "border-ember/30 bg-ember/10 font-medium text-ink"
          : "border-line bg-surface text-ink",
      )}
    >
      {children}
    </p>
  );
}
