export { PersonStep } from "@/components/onboarding/onboarding-person-step";
import { CategoryField } from "@/components/categories/category-field";
import { CountrySelect } from "@/components/geo/country-select";
import { LegalConsent } from "@/components/legal/legal-consent";
import { OrganizationKindField } from "@/components/onboarding/organization-kind-field";
import { Field, FIELD, Req, stepClass } from "@/components/onboarding/onboarding-ui";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";
import type { OrganizationKind } from "@/features/company/organization-kind";

type Bind = (i: number) => (el: HTMLFieldSetElement | null) => void;

type OrgProps = {
  active: boolean;
  bind: Bind;
  defaultKind: OrganizationKind;
  draft: OnboardingDraft | null;
};

export function OrgStep({ active, bind, defaultKind, draft }: OrgProps) {
  return (
    <fieldset ref={bind(1)} className={stepClass(active)} aria-hidden={!active}>
      <OrganizationKindField defaultKind={defaultKind} />
      <Field label={<>Organization name<Req /></>}>
        <input
          name="name"
          autoComplete="organization"
          placeholder="Official name"
          required
          defaultValue={draft?.name ?? ""}
          className={FIELD}
        />
      </Field>
      <Field label={<>Website<Req /></>} hint="Used for domain verification and shown on your profile.">
        <input
          name="website"
          placeholder="https://example.org"
          required
          defaultValue={draft?.website ?? ""}
          className={FIELD}
        />
      </Field>
    </fieldset>
  );
}

type DetailsProps = {
  active: boolean;
  bind: Bind;
  draft: OnboardingDraft | null;
};

export function DetailsStep({ active, bind, draft }: DetailsProps) {
  return (
    <fieldset ref={bind(2)} className={stepClass(active)} aria-hidden={!active}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={<>Sector<Req /></>} hint="Browse a group, or type to search.">
          <CategoryField required defaultValue={draft?.category ?? ""} className={FIELD} />
        </Field>
        <Field label={<>City<Req /></>}>
          <input
            name="city"
            autoComplete="address-level2"
            placeholder="Berlin"
            required
            defaultValue={draft?.city ?? ""}
            className={FIELD}
          />
        </Field>
        <Field label={<>Country<Req /></>}>
          <CountrySelect required defaultCode={draft?.countryCode} className={FIELD} />
        </Field>
      </div>
      <Field label={<>Short description<Req /></>}>
        <textarea
          name="description"
          required
          rows={3}
          placeholder="What you do — and who you work with."
          defaultValue={draft?.description ?? ""}
          className={`${FIELD} h-auto min-h-[6rem] resize-none py-2.5 leading-relaxed`}
        />
      </Field>
      <LegalConsent action="create" />
    </fieldset>
  );
}
