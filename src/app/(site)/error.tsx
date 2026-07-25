"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SiteError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[site]", error.message, error.digest);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        Something went wrong
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        {error.message || "The page failed to load."}
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[11px] text-plus">
          Digest: {error.digest}
        </p>
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
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-5 text-[13px] font-semibold text-ink"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
