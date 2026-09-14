import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  note,
  back,
}: {
  title: string;
  note?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div>
      {back ? (
        <Link
          href={back.href}
          className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          {back.label}
        </Link>
      ) : null}
      <h1
        className={`font-display text-[1.75rem] font-medium tracking-[-0.035em] text-ink ${
          back ? "mt-2" : ""
        }`}
      >
        {title}
      </h1>
      {note ? (
        <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-ink-soft">
          {note}
        </p>
      ) : null}
    </div>
  );
}
