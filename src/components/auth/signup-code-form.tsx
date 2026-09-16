import { verifySignupCode } from "@/features/auth/verify-signup-code";
import { resendSignupConfirmation } from "@/features/auth/actions";

type Props = {
  email: string;
  nextPath: string;
  from: "check-email" | "login";
  error?: string;
};

export function SignupCodeForm({ email, nextPath, from, error }: Props) {
  return (
    <div className="mt-6">
      <form action={verifySignupCode} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={nextPath} />
        <input type="hidden" name="from" value={from} />
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">
            4-digit code
          </span>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{4}"
            maxLength={4}
            required
            placeholder="0000"
            className="h-14 w-full rounded-lg border border-line bg-surface px-3.5 text-center font-display text-[28px] tracking-[0.28em] text-ink outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </label>
        {error ? (
          <p className="text-[13px] leading-relaxed text-ember">{error}</p>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
        >
          Confirm email
        </button>
      </form>
      <form action={resendSignupConfirmation} className="mt-3">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={nextPath} />
        <input type="hidden" name="from" value={from} />
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-line px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-mute"
        >
          Send a new code
        </button>
      </form>
    </div>
  );
}
