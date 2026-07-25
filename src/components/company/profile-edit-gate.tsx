import type { ReactNode } from "react";

/** Shared soft-gate panel for company edit auth states. */
export function ProfileEditGate({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}): ReactNode {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-[14px] text-muted">{body}</p>
      <a
        href={href}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-navy px-5 text-[13px] font-semibold text-white"
      >
        {cta}
      </a>
    </div>
  );
}
