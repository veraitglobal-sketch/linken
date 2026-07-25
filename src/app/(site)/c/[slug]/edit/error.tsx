"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CompanyEditError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[c/[slug]/edit]", error.message, error.digest);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        Could not open editor
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        {error.message || "Something went wrong loading this page."}
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[11px] text-plus">Digest: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-full bg-navy px-5 text-[13px] font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-5 text-[13px] font-semibold text-ink"
        >
          Workspace
        </Link>
      </div>
    </div>
  );
}
