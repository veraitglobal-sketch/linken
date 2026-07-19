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
};

export function VerificationCard({
  verification,
  website,
  ownerEmail,
  token,
  companySlug,
  siteUrl,
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

  const verifiedLabel =
    verification.verified && verification.method
      ? `Verified via ${methodLabel(verification.method)}`
      : "Not verified";

  const verifiedDate = verification.verifiedAt
    ? new Date(verification.verifiedAt).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <section
      id="verification"
      className="scroll-mt-28 rounded-[24px] border border-line bg-surface px-5 py-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            Verification
          </p>
          <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
            Domain verification
          </h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Prove you control your website domain. Same idea as Google Search
            Console.
          </p>
        </div>
        <div className="text-right">
          {verification.verified ? (
            <Badge tone="success">{verifiedLabel}</Badge>
          ) : (
            <Badge tone="neutral">{verifiedLabel}</Badge>
          )}
          {verifiedDate ? (
            <p className="mt-1 text-[12px] text-muted">{verifiedDate}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-white p-1">
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
              "h-10 rounded-xl text-[12px] font-semibold transition-colors sm:text-[13px]",
              method === id
                ? "bg-[#10231f] text-white"
                : "bg-transparent text-ink-soft hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-paper/50 px-4 py-4">
        {method === "email" ? (
          <div className="space-y-3">
            <p className="text-[14px] leading-relaxed text-ink-soft">
              If your login email domain matches your website domain (and is not
              a public provider), we can verify automatically.
            </p>
            <ul className="space-y-1 text-[13px] text-ink">
              <li>
                Website:{" "}
                <code className="text-[12px]">{domain ?? "—"}</code>
              </li>
              <li>
                Email domain:{" "}
                <code className="text-[12px]">{mail ?? "—"}</code>
                {mail && isPublicEmailProvider(mail) ? (
                  <span className="ml-2 text-ember"> (public provider)</span>
                ) : null}
              </li>
            </ul>
            {!emailCheck.ok ? (
              <p className="text-[13px] text-ink-soft">{emailCheck.reason}</p>
            ) : (
              <p className="text-[13px] text-[#1f6b5c]">
                Domains match — ready to verify.
              </p>
            )}
            <form action={checkEmailDomainVerification}>
              <Button type="submit" className="h-10" disabled={!emailCheck.ok}>
                Check now
              </Button>
            </form>
          </div>
        ) : null}

        {method === "dns" ? (
          <div className="space-y-3">
            <p className="text-[14px] leading-relaxed text-ink-soft">
              Add this TXT record on{" "}
              <code className="text-[12px] text-ink">{domain ?? "your domain"}</code>
              , then check.
            </p>
            <CopyBlock value={txtRecord} />
            <form action={runDnsCheck}>
              <Button type="submit" className="h-10" disabled={!domain || !token}>
                Check DNS
              </Button>
            </form>
          </div>
        ) : null}

        {method === "meta" ? (
          <div className="space-y-3">
            <p className="text-[14px] leading-relaxed text-ink-soft">
              Add the meta tag to your homepage <em>or</em> host the well-known
              file, then check.
            </p>
            <p className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
              Meta tag
            </p>
            <CopyBlock value={metaTag} />
            <p className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
              File · https://{domain ?? "domain"}/.well-known/linken-verify.txt
            </p>
            <CopyBlock value={wellKnown} />
            <form action={runMetaCheck}>
              <Button type="submit" className="h-10" disabled={!domain || !token}>
                Check meta / file
              </Button>
            </form>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
        <div>
          <p className="text-[13px] font-medium text-ink">Company logo</p>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            Pulled from your website favicon / apple-touch-icon. Manual uploads
            are never overwritten. Max 3 refreshes per day.
          </p>
        </div>
        <form action={refreshLogo}>
          <input type="hidden" name="back" value="/dashboard#verification" />
          <Button type="submit" variant="secondary" className="h-10">
            Refresh logo
          </Button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
        <div>
          <p className="text-[13px] font-medium text-ink">Website linked</p>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            Optional badge — homepage links to{" "}
            <code className="text-[11px]">
              {siteUrl}/c/{companySlug}
            </code>{" "}
            or your embed. Does not grant Verified.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Max 5 checks per company per hour. {/* TODO: cron re-check DNS/meta
        after 90 days; failure → unverified + email warning */}
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
