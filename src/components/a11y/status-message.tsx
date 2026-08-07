import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  tone?: "status" | "alert";
  className?: string;
  id?: string;
};

/** Screen-reader-friendly status / error region. */
export function StatusMessage({
  children,
  tone = "status",
  className,
  id,
}: Props) {
  return (
    <div
      id={id}
      role={tone === "alert" ? "alert" : "status"}
      aria-live={tone === "alert" ? "assertive" : "polite"}
      className={cn(
        "rounded-2xl px-4 py-3 text-sm text-ink",
        tone === "alert"
          ? "border border-ember/35 bg-ember/10"
          : "border border-line bg-paper",
        className,
      )}
    >
      {children}
    </div>
  );
}
