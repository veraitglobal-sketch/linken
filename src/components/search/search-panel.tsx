"use client";

import { useEffect, useState, useTransition } from "react";
import { CompanyResult } from "@/components/search/company-result";
import { PartnerInviteButton } from "@/components/partners/partner-invite-button";
import { Input } from "@/components/ui/input";
import {
  searchCompaniesForGraph,
  type CompanySearchHit,
} from "@/features/companies/search-action";
import type { Company } from "@/types/company";

type Props = {
  mode?: "browse" | "invite";
  excludeSlug?: string;
};

function hitToCompany(hit: CompanySearchHit): Company {
  return {
    id: hit.id,
    slug: hit.slug,
    name: hit.name,
    tagline: "",
    description: "",
    category: hit.category,
    city: hit.city,
    country: "",
    website: "",
    linkedinUrl: null,
    facebookUrl: null,
    services: [],
    verified: false,
    verifiedAt: null,
    websiteLinked: false,
    logoInitials: hit.logoInitials,
    logoUrl: hit.logoUrl,
    claimed: hit.claimed,
    acceptingClients: true,
    plan: "free",
    inviteEmail: null,
    createdBySlug: null,
    createdByName: null,
  };
}

export function SearchPanel({ mode = "browse", excludeSlug }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchHit[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      startTransition(async () => {
        const rows = await searchCompaniesForGraph(query);
        if (cancelled) return;
        setResults(
          rows.filter((r) => !excludeSlug || r.slug !== excludeSlug),
        );
      });
    }, query.trim() ? 220 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, excludeSlug]);

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search companies by name, category, or city"
        aria-label="Search companies"
      />
      <div className="flex flex-col gap-2.5">
        {results.map((hit) => (
          <CompanyResult
            key={hit.id}
            company={hitToCompany(hit)}
            action={
              mode === "invite" && hit.claimed ? (
                <PartnerInviteButton
                  companySlug={hit.slug}
                  companyName={hit.name}
                  back="/search"
                />
              ) : mode === "invite" && !hit.claimed ? (
                <span className="shrink-0 text-[11px] font-semibold text-[#94a3b8]">
                  Unclaimed
                </span>
              ) : undefined
            }
          />
        ))}
        {!pending && results.length === 0 ? (
          <div className="space-y-3 py-6 text-center">
            <p className="text-sm text-muted">
              {query.trim()
                ? "No companies match this search."
                : "No companies registered yet."}
            </p>
            <a
              href="/onboarding"
              className="inline-block text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Create your company link
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
