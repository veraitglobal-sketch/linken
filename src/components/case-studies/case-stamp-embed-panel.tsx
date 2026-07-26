"use client";

import { useMemo, useState } from "react";
import { CodeBlock } from "@/components/developers/code-block";
import { tokenizeShell } from "@/components/developers/highlight";
import { RequestClientConfirmation } from "@/components/case-studies/request-client-confirmation";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  caseStudy: CaseStudy;
  siteUrl: string;
  domainReady: boolean;
};

function buildSnippet(siteUrl: string, companySlug: string, caseSlug: string) {
  const src = `${siteUrl}/embed/${companySlug}/case/${caseSlug}`;
  return `<iframe src="${src}" width="100%" height="72" style="border:0;width:100%;max-width:100%;background:transparent" title="Confirmed on Hansala" loading="lazy"></iframe>`;
}

/** Dashboard: stamp snippet when confirmed; otherwise why + request action. */
export function CaseStampEmbedPanel({
  companySlug,
  caseStudy,
  siteUrl,
  domainReady,
}: Props) {
  const [copied, setCopied] = useState(false);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const snippet = useMemo(
    () => buildSnippet(siteUrl, companySlug, caseStudy.slug),
    [siteUrl, companySlug, caseStudy.slug],
  );
  const tokens = useMemo(() => tokenizeShell(snippet), [snippet]);

  if (!confirmed) {
    const status = caseStudy.clientConfirmation?.status;
    const why =
      status === "pending"
        ? "Waiting for the client to confirm — the stamp stays hidden until they do."
        : status === "declined"
          ? "The client declined confirmation. The stamp will not render."
          : "No client confirmation yet. A stamp on an unconfirmed project would be a self-awarded badge.";

    return (
      <div className="space-y-4">
        <div className="rounded-[20px] border border-line bg-surface p-5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Confirmation stamp
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{why}</p>
        </div>
        <RequestClientConfirmation
          companySlug={companySlug}
          caseSlug={caseStudy.slug}
        />
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[#1a5c51]/30 bg-[#1a5c51]/8 p-5">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
        Confirmation stamp
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Paste once on your case study page. It only renders when this project is
        client-confirmed — never as a pending placeholder.
      </p>
      {!domainReady ? (
        <p className="mt-3 rounded-xl border border-ember/30 bg-ember/5 px-3 py-2 text-[12px] text-ink-soft">
          Verify your website domain so browsers allow this embed on your site.
        </p>
      ) : null}
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-navy-deep ring-1 ring-navy">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="absolute top-2.5 right-2.5 z-10 rounded-lg border border-white/15 bg-navy-deep/90 px-2.5 py-1.5 text-[11px] font-semibold text-white/75 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <CodeBlock
          tokens={tokens}
          className="overflow-x-auto px-4 py-4 pr-20 font-mono text-[12px] leading-relaxed"
        />
      </div>
    </div>
  );
}
