"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { VerificationCopyBlock } from "@/components/verification/verification-copy-block";
import { runDnsCheck, runMetaCheck } from "@/features/verification/actions";

type Base = {
  domain: string | null;
  token: string | null;
};

export function DnsVerifyPanel({ domain, token }: Base) {
  const txtRecord = token ? `linken-verify=${token}` : "…";
  return (
    <div className="space-y-4">
      <Step n={1} title={`Add a TXT record on ${domain ?? "your domain"}`}>
        At your DNS host, create a TXT record with this exact value, then wait a
        few minutes for DNS to propagate.
      </Step>
      <VerificationCopyBlock value={txtRecord} />
      <Step n={2} title="Verify">
        <p className="mb-3 text-[13px] text-muted">
          When the record is live, press Verify. We read public DNS only.
        </p>
        <form action={runDnsCheck}>
          <Button
            type="submit"
            className="h-10 px-5"
            disabled={!domain || !token}
          >
            Verify domain
          </Button>
        </form>
      </Step>
    </div>
  );
}

export function MetaVerifyPanel({ domain, token }: Base) {
  const metaTag = token
    ? `<meta name="linken-verify" content="${token}" />`
    : "…";
  const wellKnown = token ?? "…";
  return (
    <div className="space-y-4">
      <Step n={1} title="Add a meta tag or well-known file">
        Put either on your live homepage — one is enough.
      </Step>
      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
            Option A · Meta tag in &lt;head&gt;
          </p>
          <VerificationCopyBlock value={metaTag} />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
            Option B · /.well-known/linken-verify.txt
          </p>
          <VerificationCopyBlock value={wellKnown} />
        </div>
      </div>
      <Step n={2} title="Verify">
        <p className="mb-3 text-[13px] text-muted">
          After publishing, press Verify. We fetch your site over HTTPS.
        </p>
        <form action={runMetaCheck}>
          <Button
            type="submit"
            className="h-10 px-5"
            disabled={!domain || !token}
          >
            Verify domain
          </Button>
        </form>
      </Step>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white">
          {n}
        </span>
        <p className="text-[14px] font-semibold tracking-[-0.02em] text-ink">
          {title}
        </p>
      </div>
      <div className="mt-2 pl-[2.125rem] text-[13px] leading-relaxed text-muted">
        {children}
      </div>
    </div>
  );
}
