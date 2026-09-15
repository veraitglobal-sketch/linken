"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { allowMcpConsent, denyMcpConsent } from "@/features/oauth/actions";
import type { AuthorizeQuery, ConsentCompany } from "@/features/oauth/types";
import { Button } from "@/components/ui/button";

type Props = {
  clientName: string;
  companies: ConsentCompany[];
  query: AuthorizeQuery;
  notice?: string | null;
};

function HiddenQuery({ query }: { query: AuthorizeQuery }) {
  return (
    <>
      <input type="hidden" name="response_type" value="code" />
      <input type="hidden" name="client_id" value={query.clientId} />
      <input type="hidden" name="redirect_uri" value={query.redirectUri} />
      <input type="hidden" name="code_challenge" value={query.codeChallenge} />
      <input type="hidden" name="code_challenge_method" value="S256" />
      <input type="hidden" name="scope" value={query.scope} />
      {query.state ? <input type="hidden" name="state" value={query.state} /> : null}
      {query.resource ? <input type="hidden" name="resource" value={query.resource} /> : null}
    </>
  );
}

export function OauthConsentForm({ clientName, companies, query, notice }: Props) {
  const initial = useMemo(
    () => companies.find((c) => c.agentApi)?.id ?? companies[0]?.id ?? "",
    [companies],
  );
  const [companyId, setCompanyId] = useState(initial);
  const selected = companies.find((c) => c.id === companyId);
  const pro = Boolean(selected?.agentApi);
  const companyName = selected?.name ?? "your company";

  return (
    <>
      <h1 className="mt-3 font-display text-[34px] leading-tight font-semibold tracking-[-0.035em] text-ink">
        Allow {clientName} to manage {companyName} on Hansala?
      </h1>
      {notice ? (
        <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{notice}</p>
      ) : null}
      {companies.length === 0 ? (
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          You need to be an owner or admin of a company on Hansala to connect this.
        </p>
      ) : (
        <ConsentFields
          companies={companies}
          companyId={companyId}
          onCompany={setCompanyId}
          pro={pro}
          query={query}
        />
      )}
    </>
  );
}

function ConsentFields({
  companies,
  companyId,
  onCompany,
  pro,
  query,
}: {
  companies: ConsentCompany[];
  companyId: string;
  onCompany: (id: string) => void;
  pro: boolean;
  query: AuthorizeQuery;
}) {
  return (
    <div className="mt-8">
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">Company</span>
        <select
          required
          value={companyId}
          onChange={(e) => onCompany(e.target.value)}
          className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink"
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
        Read and manage partners, case studies, testimonials, widgets, verification and team.
      </p>
      <p className="mt-3 text-[13px] text-muted">
        You can disconnect any time in Dashboard → API.
      </p>
      {pro ? (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <form action={allowMcpConsent}>
            <HiddenQuery query={query} />
            <input type="hidden" name="company_id" value={companyId} />
            <Button type="submit" className="h-11 px-6">
              Allow
            </Button>
          </form>
          <form action={denyMcpConsent}>
            <HiddenQuery query={query} />
            <Button type="submit" variant="secondary" className="h-11 px-6">
              Cancel
            </Button>
          </form>
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Managing your company from Claude is part of Pro.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-3 inline-block text-[14px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Open billing
          </Link>
          <form action={denyMcpConsent} className="mt-6">
            <HiddenQuery query={query} />
            <Button type="submit" variant="secondary" className="h-11 px-6">
              Cancel
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
