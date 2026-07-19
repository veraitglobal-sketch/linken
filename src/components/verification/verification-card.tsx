"use client";

import { useMemo, useState } from "react";
import { refreshLogo } from "@/features/logo/actions";
import {
  checkEmailDomainVerification,
  runBacklinkCheck,
  runDnsCheck,
  runMetaCheck,
} from "@/features/verification/actions";
import {
  domainsMatch,
  isPublicEmailProvider,
  emailDomain,
  extractDomain,
} from "@/features/verification/domain";
import type { CompanyVerification } from "@/features/verification/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Method = "email" | "dns" | "meta";

type Props = {
  verification: CompanyVerification;
  website: string;
  ownerEmail: string;
  token: string | null;
  companySlug: string;
  siteUrl: string;
  /** From URL after verify attempt */
  flash?: {
    ok?: "email" | "dns" | "meta" | "linked" | "logo";
    error?: string;
  };
};

export function VerificationCard({
  verification,
  website,
  ownerEmail,
  token,
  companySlug,
  siteUrl,
  flash,
}: Props) {
  const [method, setMethod] = useState<Method>("email");
  const domain = extractDomain(website);
  const mail = emailDomain(ownerEmail);
  const emailCheck = useMemo(
    () => domainsMatch(website, ownerEmail),
    [website, ownerEmail],
  );

  const txtRecord = token ? `linken-verify=${token}` : "…";
  const metaTag = token
    ? `<meta name="linken-verify" content="${token}" />`
    : "…";
  const wellKnown = token ?? "…";

  const verifiedDate = verification.verifiedAt
    ? new Date(verification.verifiedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const successMessage = flash?.ok
    ? flash.ok === "linked"
      ? "Website link found on your homepage."
      : flash.ok === "logo"
        ? "Logo refreshed from your website."
        : `Domain verified successfully via ${flash.ok === "email" ? "email" : flash.ok === "dns" ? "DNS TXT" : "meta / file"}.`
    : null;

  return (
    <section
      id="verification"
      className="scroll-mt-28 rounded-[28px] border border-line bg-white px-5 py-7 sm:px-8 sm:py-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
            Domain verification
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.4rem,2.4vw,1.85rem)] font-medium tracking-[-0.035em] text-ink">
            Prove you control {domain ?? "your website"}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Pick a method, complete the step, then verify. Only domain owners
            get the Verified badge.
          </p>
        </div>
        <div className="shrink-0 text-right">
          {verification.verified ? (
            <Badge tone="success" className="text-[11px] tracking-[0.06em] uppercase">
              Verified
              {verification.method ? ` · ${methodLabel(verification.method)}` : ""}
            </Badge>
          ) : (
            <Badge tone="neutral" className="text-[11px] tracking-[0.06em] uppercase">
              Not verified
            </Badge>
          )}
          {verifiedDate ? (
            <p className="mt-1.5 text-[12px] text-muted">{verifiedDate}</p>
          ) : null}
        </div>
      </div>

      {successMessage ? (
        <div
          role="status"
          className="mt-5 rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-[14px] font-medium text-ink"
        >
          {successMessage}
        </div>
      ) : null}

      {flash?.error ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-[14px] text-ink"
        >
          <p className="font-semibold">Verification failed</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {flash.error}
          </p>
        </div>
      ) : null}

      {!domain ? (
        <div className="mt-5 rounded-2xl border border-line bg-[#f7f8fa] px-4 py-4 text-[14px] text-ink-soft">
          Add a company website first (onboarding / company setup), then return
          here to verify the domain.
        </div>
      ) : null}

      <div className="mt-6">
        <p className="text-[12px] font-semibold tracking-[0.1em] text-muted uppercase">
          How do you want to verify?
        </p>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-white p-1">
          {(
            [
              ["email", "Email"],
              ["dns", "DNS TXT"],
              ["meta", "Meta / file"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMethod(id)}
              className={cn(
                "h-11 rounded-xl text-[12px] font-semibold transition-colors sm:text-[13px]",
                method === id
                  ? "bg-[#10231f] text-white"
                  : "bg-transparent text-ink-soft hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-5">
        {method === "email" ? (
          <div className="space-y-4">
            <div>
              <p className="text-[14px] font-medium text-ink">1. Match work email</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                Your login email domain must match the website domain (not
                Gmail, Outlook, etc.).
              </p>
            </div>
            <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-white px-3 py-2.5">
                <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                  Website domain
                </dt>
                <dd className="mt-1 font-mono text-[12px] text-ink">
                  {domain ?? "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-line bg-white px-3 py-2.5">
                <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                  Email domain
                </dt>
                <dd className="mt-1 font-mono text-[12px] text-ink">
                  {mail ?? "—"}
                  {mail && isPublicEmailProvider(mail) ? (
                    <span className="ml-1.5 font-sans text-ember">
                      · public provider
                    </span>
                  ) : null}
                </dd>
              </div>
            </dl>
            {!emailCheck.ok ? (
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {emailCheck.reason} Use DNS TXT or Meta / file instead.
              </p>
            ) : (
              <p className="text-[13px] font-medium text-[#1f6b5c]">
                Domains match — ready to verify.
              </p>
            )}
            <form action={checkEmailDomainVerification}>
              <Button type="submit" className="h-11 px-6" disabled={!emailCheck.ok}>
                Verify domain
              </Button>
            </form>
          </div>
        ) : null}

        {method === "dns" ? (
          <div className="space-y-4">
            <div>
              <p className="text-[14px] font-medium text-ink">
                1. Add this TXT record on {domain ?? "your domain"}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                At your DNS host (Cloudflare, GoDaddy, etc.), create a TXT
                record with this exact value, then wait a few minutes.
              </p>
            </div>
            <CopyBlock value={txtRecord} />
            <div>
              <p className="text-[14px] font-medium text-ink">2. Verify</p>
              <p className="mt-1 text-[13px] text-ink-soft">
                When the record is live, press Verify. We read public DNS only.
              </p>
            </div>
            <form action={runDnsCheck}>
              <Button
                type="submit"
                className="h-11 px-6"
                disabled={!domain || !token}
              >
                Verify domain
              </Button>
            </form>
          </div>
        ) : null}

        {method === "meta" ? (
          <div className="space-y-4">
            <div>
              <p className="text-[14px] font-medium text-ink">
                1. Add a meta tag or well-known file
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                Put either on your live homepage — one is enough.
              </p>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                Option A · Meta tag in &lt;head&gt;
              </p>
              <CopyBlock value={metaTag} />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                Option B · https://{domain ?? "domain"}/.well-known/linken-verify.txt
              </p>
              <CopyBlock value={wellKnown} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-ink">2. Verify</p>
              <p className="mt-1 text-[13px] text-ink-soft">
                After publishing, press Verify. We fetch your site over HTTPS.
              </p>
            </div>
            <form action={runMetaCheck}>
              <Button
                type="submit"
                className="h-11 px-6"
                disabled={!domain || !token}
              >
                Verify domain
              </Button>
            </form>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line px-4 py-4">
          <p className="text-[13px] font-medium text-ink">Website linked</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            Optional — homepage links to{" "}
            <span className="font-mono text-[11px] text-ink">
              /c/{companySlug}
            </span>
            . Not the same as Verified.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {verification.websiteLinked ? (
              <Badge tone="success">Linked</Badge>
            ) : (
              <Badge tone="neutral">Not linked</Badge>
            )}
            <form action={runBacklinkCheck}>
              <Button type="submit" variant="secondary" className="h-10">
                Check link
              </Button>
            </form>
          </div>
        </div>
        <div className="rounded-2xl border border-line px-4 py-4">
          <p className="text-[13px] font-medium text-ink">Company logo</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            Auto from favicon / apple-touch-icon. Manual uploads are never
            overwritten.
          </p>
          <form action={refreshLogo} className="mt-3">
            <input type="hidden" name="back" value="/dashboard/verification" />
            <Button type="submit" variant="secondary" className="h-10">
              Refresh logo
            </Button>
          </form>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Max 5 verification checks per hour · {siteUrl.replace(/^https?:\/\//, "")}
      </p>
    </section>
  );
}

function methodLabel(method: string) {
  if (method === "email_domain") return "email";
  if (method === "dns_txt") return "DNS";
  if (method === "meta_tag") return "meta";
  return method;
}

function CopyBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-[#0a1714]">
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-white/70 hover:text-white"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
      <pre className="overflow-x-auto px-3 py-3 pr-16 font-mono text-[11px] leading-relaxed text-white/80">
        {value}
      </pre>
    </div>
  );
}
