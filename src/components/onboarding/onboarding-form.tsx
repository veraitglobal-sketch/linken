"use client";

import { StatusMessage } from "@/components/a11y/status-message";
import { OrganizationKindField } from "@/components/onboarding/organization-kind-field";
import type { OnboardingPreviewValues } from "@/components/onboarding/onboarding-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LegalConsent } from "@/components/legal/legal-consent";
import { createCompany } from "@/features/company/actions";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";
import { parseOrganizationKind } from "@/features/company/organization-kind";

type Props = {
  error?: string;
  draft?: OnboardingDraft | null;
  partnerMode?: boolean;
  values: OnboardingPreviewValues;
  onField: (field: keyof OnboardingPreviewValues, value: string) => void;
};

export function OnboardingForm({
  error,
  draft = null,
  partnerMode = false,
  values,
  onField,
}: Props) {
  const defaultKind =
    parseOrganizationKind(draft?.organizationKind ?? "") ??
    (partnerMode ? "developer_partner" : "company");

  return (
    <div className="relative flex flex-col justify-center bg-surface px-6 py-8 sm:px-10 sm:py-10">
      <div className="animate-rise">
        <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
          {partnerMode ? "Partner details" : "Profile details"}
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.035em] text-ink">
          {partnerMode
            ? "Register as a developer partner"
            : "Create your company profile"}
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
          {partnerMode
            ? "Your workspace opens on Earnings. Share your referral link with clients you already work with."
            : "Company, nonprofit or association — confirmation works the same way. Takes about two minutes."}
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
          <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            Organization name
          </span>
          <Input
            name="name"
            placeholder="Official name"
            required
            value={values.name}
            onChange={(e) => onField("name", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            Website
          </span>
          <Input
            name="website"
            placeholder="https://example.org"
            required
            value={values.website}
            onChange={(e) => onField("website", e.target.value)}
          />
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
            Used for domain verification and shown on your profile. After setup,
            add a Hansala embed on this site so visitors can verify you.
          </p>
        </label>

        <div className="my-1 border-t border-line/60" aria-hidden />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Sector
            </span>
            <Input
              name="category"
              placeholder="Architecture, software…"
              required
              value={values.category}
              onChange={(e) => onField("category", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              City
            </span>
            <Input
              name="city"
              placeholder="Berlin"
              required
              value={values.city}
              onChange={(e) => onField("city", e.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            Short description
          </span>
          <textarea
            name="description"
            required
            rows={3}
            placeholder="What you do — and who you work with."
            defaultValue={draft?.description ?? ""}
            className="min-h-[5.5rem] w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-muted focus:border-blue focus:bg-surface focus:ring-2 focus:ring-[rgba(126,184,164,0.22)]"
          />
        </label>

        <Button type="submit" className="mt-1 h-12 w-full">
          {partnerMode ? "Create partner workspace" : "Create company profile"}
        </Button>
        <p className="text-center text-[12.5px] text-muted">
          Free · No card needed · Nothing goes public until confirmed
        </p>
        <LegalConsent action="create" />
      </form>
    </div>
  );
}
