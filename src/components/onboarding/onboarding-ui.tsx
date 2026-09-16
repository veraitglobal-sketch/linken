import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const FIELD =
  "h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-navy focus:ring-2 focus:ring-navy/10";

export const STEPS = [
  {
    title: "Who is setting this up?",
    lead: "Your work email is where confirmations and partner requests arrive.",
  },
  {
    title: "Your organization",
    lead: "The name and website clients will recognise.",
  },
  {
    title: "Tell clients what you do",
    lead: "Shown on your profile. You can change it later.",
  },
] as const;

export function Req() {
  return <span className="text-muted"> *</span>;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: ReactNode;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-[12.5px] leading-relaxed text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

/** Park inactive steps without display:none or inert — both drop or wipe values on Create. */
export function stepClass(active: boolean) {
  return cn(
    "m-0 border-0 p-0",
    active ? "space-y-4" : "pointer-events-none absolute h-px w-px overflow-hidden opacity-0",
  );
}
