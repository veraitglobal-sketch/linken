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
import Link from "next/link";

type Props = {
  mode?: "browse" | "invite";
  excludeSlug?: string;
  includeUnclaimed?: boolean;
  searchOnEmpty?: boolean;
  initialQuery?: string;
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

export function SearchPanel({
  mode = "browse",
  excludeSlug,
  includeUnclaimed = false,
  searchOnEmpty = true,
  initialQuery = "",
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CompanySearchHit[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim() && !searchOnEmpty) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      startTransition(async () => {
        const rows = await searchCompaniesForGraph(query, { includeUnclaimed });
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
  }, [query, excludeSlug, includeUnclaimed, searchOnEmpty]);

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
                  back="/dashboard/partners"
                />
              ) : mode === "invite" && !hit.claimed ? (
                <span className="shrink-0 text-[11px] font-semibold text-muted">
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
                : searchOnEmpty
                  ? "No companies registered yet."
                  : "Type a company name, category, or city."}
            </p>
            <Link
              href="/onboarding"
              className="inline-block text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Create your company link
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
