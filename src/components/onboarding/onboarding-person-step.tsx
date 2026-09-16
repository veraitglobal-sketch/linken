import { PasswordField } from "@/components/auth/password-field";
import { Field, FIELD, Req, stepClass } from "@/components/onboarding/onboarding-ui";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";

type Bind = (i: number) => (el: HTMLFieldSetElement | null) => void;

type Props = {
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
}: Props) {
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
          {active ? (
            <PasswordField
              label={<>Password<Req /></>}
              labelClassName="text-[13px] font-semibold text-ink"
              name="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              required
              minLength={6}
              defaultValue={password}
              onChange={(e) => onPassword(e.target.value)}
              className={FIELD}
              forgotHref="/login/forgot"
            />
          ) : (
            <input type="hidden" name="password" value={password} />
          )}
        </>
      )}
    </fieldset>
  );
}
