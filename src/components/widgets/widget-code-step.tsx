"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/developers/code-block";
import type { CodeToken } from "@/components/developers/highlight";
import { Button } from "@/components/ui/button";

type Props = {
  proLocked: boolean;
  /** True when company has a verified website domain for frame-ancestors. */
  domainReady: boolean;
  tokens: CodeToken[];
  copied: boolean;
  onCopy: () => void;
  onBack: () => void;
  onDone: () => void;
};

export function WidgetCodeStep({
  proLocked,
  domainReady,
  tokens,
  copied,
  onCopy,
  onBack,
  onDone,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {proLocked ? (
          <div className="rounded-2xl border border-line bg-paper/60 px-5 py-10 text-center">
            <p className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
              Available on Pro
            </p>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted">
              This is a Pro embed. Upgrade on Billing to copy the snippet for
              your site. Preview still uses your live profile data.
            </p>
            <p className="mt-4 text-[11px] font-semibold tracking-[0.1em] text-plus uppercase">
              <Link
                href="/dashboard/billing"
                className="underline-offset-2 hover:underline"
              >
                Upgrade to Pro
              </Link>
            </p>
          </div>
        ) : (
          <>
            {!domainReady ? (
              <div className="mb-4 rounded-2xl border border-ember/30 bg-ember/5 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                <p className="font-semibold text-ink">Verify your website first</p>
                <p className="mt-1">
                  Until your domain is verified, browsers will only allow this
                  badge on Hansala itself — not on customer sites.{" "}
                  <Link
                    href="/dashboard/verification"
                    className="font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    Go to Verification
                  </Link>
                </p>
              </div>
            ) : null}
            <p className="text-[13px] leading-relaxed text-ink">
              Paste this iframe on your verified website. It only renders as
              trusted there (and in your Hansala preview).
            </p>
            <div className="relative mt-4 overflow-hidden rounded-2xl bg-navy-deep ring-1 ring-navy">
              <button
                type="button"
                onClick={onCopy}
                className="absolute top-2.5 right-2.5 z-10 rounded-lg border border-white/15 bg-navy-deep/90 px-2.5 py-1.5 text-[11px] font-semibold text-white/75 transition-colors hover:border-white/30 hover:text-white"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <CodeBlock
                tokens={tokens}
                className="overflow-x-auto px-4 py-4 pr-20 font-mono text-[12px] leading-relaxed"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2 border-t border-line bg-paper/40 px-5 py-3.5 sm:px-6">
        <Button type="button" variant="ghost" className="h-10" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          {!proLocked ? (
            <Button
              type="button"
              variant="secondary"
              className="h-10"
              onClick={onCopy}
            >
              {copied ? "Copied" : "Copy code"}
            </Button>
          ) : null}
          <Button type="button" className="h-10 px-5" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
