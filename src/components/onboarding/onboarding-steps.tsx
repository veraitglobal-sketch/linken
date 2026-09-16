import { CategoryField } from "@/components/categories/category-field";
import { CountrySelect } from "@/components/geo/country-select";
import { LegalConsent } from "@/components/legal/legal-consent";
import { OrganizationKindField } from "@/components/onboarding/organization-kind-field";
import { Field, FIELD, Req, stepClass } from "@/components/onboarding/onboarding-ui";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";
import type { OrganizationKind } from "@/features/company/organization-kind";

type Bind = (i: number) => (el: HTMLFieldSetElement | null) => void;

type PersonProps = {
  active: boolean;
  bind: Bind;
  signedIn: boolean;
  accountEmail: string | null;
  draft: OnboardingDraft | null;
  password: string;
  onPassword: (value: string) => void;
};

export function PersonStep({
  active,
  bind,
  signedIn,
  accountEmail,
  draft,
  password,
  onPassword,
}: PersonProps) {
  return (
    <fieldset ref={bind(0)} className={stepClass(active)} aria-hidden={!active}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={<>Full name<Req /></>}>
          <input
            name="display_name"
            autoComplete="name"
            placeholder="Jane Doe"
            required
            defaultValue={draft?.displayName ?? ""}
            className={FIELD}
          />
        </Field>
        <Field label="Your role">
          <input
            name="display_title"
            autoComplete="organization-title"
            placeholder="Managing Director"
            defaultValue={draft?.displayTitle ?? ""}
            className={FIELD}
          />
        </Field>
      </div>
      {signedIn ? (
        <div className="rounded-lg bg-mute px-4 py-3">
          <p className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
            Signed in as
          </p>
          <p className="mt-0.5 text-[15px] font-semibold text-ink">{accountEmail}</p>
          <p className="mt-1 text-[12.5px] text-muted">
            Confirmations and partner requests arrive here.
          </p>
        </div>
      ) : (
        <>
          <Field
            label={<>Work email<Req /></>}
            hint="Use your company address — if it matches your website, your domain is verified automatically."
          >
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              defaultValue={draft?.email ?? ""}
              className={FIELD}
            />
          </Field>
          <Field label={<>Password<Req /></>}>
            {active ? (
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                required
                minLength={6}
                defaultValue={password}
                onChange={(e) => onPassword(e.target.value)}
                className={FIELD}
              />
            ) : (
              <input type="hidden" name="password" value={password} />
            )}
          </Field>
        </>
      )}
    </fieldset>
  );
}

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
        <Field label={<>Sector<Req /></>}>
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
