"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  flashSuccessMessage,
  VerificationError,
  VerificationNoWebsite,
  VerificationSuccess,
} from "@/components/verification/verification-flash";
import { VerificationLinked } from "@/components/verification/verification-linked";
import {
  DnsVerifyPanel,
  EmailVerifyPanel,
  MetaVerifyPanel,
} from "@/components/verification/verification-method-panels";
import {
  domainsMatch,
  emailDomain,
  extractDomain,
  isPublicEmailProvider,
} from "@/features/verification/domain";
import type { CompanyVerification } from "@/features/verification/queries";
import { cn } from "@/lib/cn";

type Method = "email" | "dns" | "meta";

type Props = {
  verification: CompanyVerification;
  website: string;
  ownerEmail: string;
  token: string | null;
  companySlug: string;
  siteUrl: string;
  flash?: {
    ok?: "email" | "dns" | "meta" | "linked" | "logo";
    error?: string;
  };
};

const METHODS: { id: Method; label: string; hint: string }[] = [
  { id: "email", label: "Email", hint: "Work email" },
  { id: "dns", label: "DNS TXT", hint: "DNS host" },
  { id: "meta", label: "Meta / file", hint: "On site" },
];

function pickDefaultMethod(website: string, ownerEmail: string): Method {
  const check = domainsMatch(website, ownerEmail);
  const mail = emailDomain(ownerEmail);
  if (check.ok && mail && !isPublicEmailProvider(mail)) return "email";
  return "dns";
}

export function VerificationCard({
  verification,
  website,
  ownerEmail,
  token,
  companySlug,
  siteUrl,
  flash,
}: Props) {
  const domain = extractDomain(website);
  const mail = emailDomain(ownerEmail);
  const defaultMethod = useMemo(
    () => pickDefaultMethod(website, ownerEmail),
    [website, ownerEmail],
  );
  const [method, setMethod] = useState<Method>(defaultMethod);
  const successMessage = flashSuccessMessage(flash?.ok);

  return (
    <div className="space-y-4">
      <section
        id="verification"
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgba(8,20,18,0.03)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-paper/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
              Domain verification
            </p>
            <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
              Prove you control {domain ?? "your website"}
            </h2>
            <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-muted">
              Complete one method. Only domain owners get the Verified badge.
            </p>
          </div>
          <Badge
            tone="neutral"
            className="shrink-0 text-[10px] tracking-[0.06em] uppercase"
          >
            Not verified
          </Badge>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          {successMessage ? (
            <VerificationSuccess message={successMessage} />
          ) : null}
          {flash?.error ? <VerificationError message={flash.error} /> : null}
          {!domain ? <VerificationNoWebsite /> : null}

          <div>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
              Method
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-paper/50 p-1">
              {METHODS.map(({ id, label, hint }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={cn(
                    "rounded-xl px-2 py-2 text-center transition-colors",
                    method === id
                      ? "bg-navy text-white shadow-sm"
                      : "text-ink-soft hover:bg-surface hover:text-ink",
                  )}
                >
                  <span className="block text-[12px] font-semibold sm:text-[13px]">
                    {label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 hidden text-[10px] sm:block",
                      method === id ? "text-white/65" : "text-plus",
                    )}
                  >
                    {hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-paper/30 px-4 py-4 sm:px-5">
            {method === "email" ? (
              <EmailVerifyPanel
                domain={domain}
                mail={mail}
                website={website}
                ownerEmail={ownerEmail}
              />
            ) : null}
            {method === "dns" ? (
              <DnsVerifyPanel domain={domain} token={token} />
            ) : null}
            {method === "meta" ? (
              <MetaVerifyPanel domain={domain} token={token} />
            ) : null}
          </div>

          <p className="text-[11px] text-muted">
            Logo in{" "}
            <Link
              href="/dashboard/settings"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Settings
            </Link>
            {" · "}
            Max 5 checks / hour · {siteUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </section>

      <VerificationLinked
        companySlug={companySlug}
        linked={verification.websiteLinked}
      />
    </div>
  );
}
