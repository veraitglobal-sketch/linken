import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { UseCasePage } from "@/features/seo/use-cases/types";

const TONE = {
  lime: "bg-lime",
  "lime-soft": "bg-lime-soft",
  surface: "bg-surface",
} as const;

export function UseCaseIndexCard({
  page,
  tone,
  children,
}: {
  page: UseCasePage;
  tone: keyof typeof TONE;
  children: ReactNode;
}) {
  return (
    <Link
      href={`/use-cases/${page.slug}`}
      className={cn(
        "group flex min-h-[449px] flex-col overflow-hidden rounded-hero px-7 pt-7 no-underline transition-transform duration-200 hover:-translate-y-0.5",
        TONE[tone],
      )}
    >
      <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
        {page.eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[24px] leading-tight font-semibold tracking-[-0.025em] text-ink">
        {page.title}
      </h2>
      <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">{page.description}</p>
      <div className="mt-auto -mx-7 w-[calc(100%+3.5rem)] pt-8">{children}</div>
    </Link>
  );
}
