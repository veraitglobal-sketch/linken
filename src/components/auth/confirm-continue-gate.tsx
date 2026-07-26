import {
  continueWithPassword,
  sendConfirmMagicLink,
} from "@/features/auth/confirm-continue-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  next: string;
  invitedEmail?: string;
  companyName: string;
  inviterName?: string | null;
  error?: string;
  checkEmail?: boolean;
  checkEmailAddress?: string;
};

/** Confirm-first gate — guest magic link or password continue. */
export function ConfirmContinueGate({
  next,
  invitedEmail,
  companyName,
  inviterName,
  error,
  checkEmail = false,
  checkEmailAddress,
}: Props) {
  if (checkEmail) {
    return (
      <div className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
          Check your email
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          Confirm link sent
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          We emailed{" "}
          <span className="font-semibold text-ink">
            {checkEmailAddress || invitedEmail || "you"}
          </span>
          . Open it to finish confirming {companyName}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
      {error ? (
        <p className="mb-4 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Partnership
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        Confirm {companyName}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        {inviterName ? (
          <>
            <span className="font-semibold text-ink">{inviterName}</span> invited
            you. Continue with the invited email — no separate signup page.
          </>
        ) : (
          <>Continue with your email to confirm this partnership.</>
        )}
      </p>

      <form action={sendConfirmMagicLink} className="mt-5 flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <Input
          type="email"
          name="email"
          required
          placeholder="Work email"
          defaultValue={invitedEmail}
        />
        <Button type="submit" className="h-11">
          Email me a confirm link
        </Button>
        <p className="text-[12px] text-muted">
          Fastest — opens this page signed in. No password needed.
        </p>
      </form>

      <form
        action={continueWithPassword}
        className="mt-6 flex flex-col gap-3 border-t border-line pt-5"
      >
        <input type="hidden" name="next" value={next} />
        <p className="text-[13px] font-medium text-ink">
          Or continue with a password
        </p>
        <Input
          type="email"
          name="email"
          required
          placeholder="Work email"
          defaultValue={invitedEmail}
        />
        <Input
          type="password"
          name="password"
          required
          minLength={6}
          placeholder="Password (min 6)"
        />
        <Button type="submit" variant="secondary" className="h-11">
          Continue
        </Button>
        <p className="text-[12px] text-muted">
          Signs you in, or creates your Hansala login if you’re new.
        </p>
      </form>
    </div>
  );
}
