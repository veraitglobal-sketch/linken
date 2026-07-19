"use client";

import { useMemo, useState } from "react";
import { CompanyResult } from "@/components/search/company-result";
import { RequestPartnerButton } from "@/components/partners/request-partner-button";
import { Input } from "@/components/ui/input";
import { companies } from "@/data/mock/companies";

type Props = {
  mode?: "browse" | "invite";
  excludeSlug?: string;
};

export function SearchPanel({ mode = "browse", excludeSlug }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (excludeSlug && company.slug === excludeSlug) return false;
      if (!q) return true;
      return (
        company.name.toLowerCase().includes(q) ||
        company.category.toLowerCase().includes(q) ||
        company.city.toLowerCase().includes(q)
      );
    });
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
        {results.map((company) => (
          <CompanyResult
            key={company.id}
            company={company}
            action={
              mode === "invite" ? (
                <RequestPartnerButton companyName={company.name} />
              ) : undefined
            }
          />
        ))}
        {results.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No companies found. A company must create a profile before it can be
            invited.
          </p>
        ) : null}
      </div>
    </div>
  );
}
