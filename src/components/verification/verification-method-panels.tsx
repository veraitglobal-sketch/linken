"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { VerificationCopyBlock } from "@/components/verification/verification-copy-block";
import {
  checkEmailDomainVerification,
  runDnsCheck,
  runMetaCheck,
} from "@/features/verification/actions";
import {
  domainsMatch,
  isPublicEmailProvider,
} from "@/features/verification/domain";

type Base = {
  domain: string | null;
  token: string | null;
};

export function EmailVerifyPanel({
  domain,
  mail,
  website,
  ownerEmail,
}: {
  domain: string | null;
  mail: string | null;
  website: string;
  ownerEmail: string;
}) {
  const emailCheck = domainsMatch(website, ownerEmail);
  const publicMail = Boolean(mail && isPublicEmailProvider(mail));

  return (
    <div className="space-y-4">
      <Step n={1} title="Match work email">
        Your login email domain must match the website domain — not Gmail,
        Outlook, or other public providers.
      </Step>
      <dl className="grid gap-2 sm:grid-cols-2">
        <DomainTile label="Website domain" value={domain ?? "—"} />
        <DomainTile
          label="Email domain"
          value={mail ?? "—"}
          warn={publicMail ? "Public provider" : undefined}
        />
      </dl>
      {emailCheck.ok ? (
        <p className="text-[13px] font-medium text-blue">
          Domains match — ready to verify.
        </p>
      ) : (
        <p className="rounded-xl border border-ember/25 bg-ember/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
          {emailCheck.reason} Use DNS TXT or Meta / file instead.
        </p>
      )}
      <Step n={2} title="Verify">
        <form action={checkEmailDomainVerification}>
          <Button type="submit" className="h-10 px-5" disabled={!emailCheck.ok}>
            Verify domain
          </Button>
        </form>
      </Step>
    </div>
  );
}

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

function DomainTile({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-paper/60 px-3.5 py-3">
      <dt className="text-[10px] font-semibold tracking-[0.1em] text-plus uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-[12px] text-ink">
        {value}
        {warn ? (
          <span className="ml-1.5 font-sans text-[11px] font-semibold text-ember">
            · {warn}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
