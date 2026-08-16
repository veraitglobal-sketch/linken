"use client";

import { useState } from "react";
import { StatusMessage } from "@/components/a11y/status-message";
import { OrganizationKindField } from "@/components/onboarding/organization-kind-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LegalConsent } from "@/components/legal/legal-consent";
import { createCompany } from "@/features/company/actions";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";
import { parseOrganizationKind } from "@/features/company/organization-kind";
import { COMPANY_SHARE_PREFIX } from "@/lib/site";
import { toSlug } from "@/lib/slug";

type Props = {
  error?: string;
  draft?: OnboardingDraft | null;
};

export function OnboardingForm({ error, draft = null }: Props) {
  const [name, setName] = useState(draft?.name ?? "");
  const slug = toSlug(name) || "your-organization";
  const defaultKind = parseOrganizationKind(draft?.organizationKind ?? "") ?? "company";

  return (
    <div className="relative flex flex-col justify-center border-t border-line bg-[#fbfbfc] px-6 py-8 sm:px-9 sm:py-10 lg:border-t-0 lg:border-l lg:border-white/10">
      <div className="animate-rise">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#1a5c51] uppercase">
          Profile details
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.035em] text-ink">
          Register your organization
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
          Company, nonprofit, association, or party — same mutual confirmation.
          Your public link is what partners open.
        </p>
      </div>

      <div className="animate-rise-delay mt-5 rounded-2xl border border-[#0e1f1c]/10 bg-[#0e1f1c] px-4 py-3 text-white">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-white/45 uppercase">
          Your link
        </p>
        <p className="mt-1 font-display text-lg tracking-[-0.03em]">
          {COMPANY_SHARE_PREFIX}/<span className="text-[#7eb8a4]">{slug}</span>
        </p>
      </div>

      {error ? (
        <StatusMessage tone="alert" className="mt-4">
          {error}
        </StatusMessage>
      ) : null}

      <form
        action={createCompany}
        className="animate-rise-late mt-6 flex flex-col gap-4"
      >
        <OrganizationKindField defaultKind={defaultKind} />

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Organization name
          </span>
          <Input
            name="name"
            placeholder="Official name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Website
          </span>
          <Input
            name="website"
            placeholder="https://example.org"
            required
            defaultValue={draft?.website ?? ""}
          />
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
            Used for domain verification and shown on your profile. After setup,
            add a Hansala embed on this site so visitors can verify you.
          </p>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Sector
            </span>
            <Input
              name="category"
              placeholder="Health, construction…"
              required
              defaultValue={draft?.category ?? ""}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              City
            </span>
            <Input
              name="city"
              placeholder="Berlin"
              required
              defaultValue={draft?.city ?? ""}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Short description
          </span>
          <textarea
            name="description"
            required
            rows={3}
            placeholder="What you do — and who you work with."
            defaultValue={draft?.description ?? ""}
            className="min-h-[5.5rem] w-full resize-none rounded-xl border border-line bg-white px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-muted focus:border-[#1a5c51] focus:ring-2 focus:ring-[rgba(31,107,92,0.15)]"
          />
        </label>

        <Button type="submit" className="mt-1 h-12 w-full">
          Create organization profile
        </Button>
        <LegalConsent action="create" />
      </form>
    </div>
  );
}
