import { resendSignupConfirmation } from "@/features/auth/actions";
import { StatusMessage } from "@/components/a11y/status-message";
import { Input } from "@/components/ui/input";

export function LoginVerifyNotice({
  email,
  resent,
  nextPath,
}: {
  email?: string;
  resent?: string;
  nextPath: string;
}) {
  return (
    <StatusMessage className="animate-rise mb-6 border-[#1a5c51]/25 bg-[#1a5c51]/8">
      <p className="text-[13px] font-semibold text-ink">
        {resent === "1" ? "Confirmation email sent again" : "Check your email"}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
        We sent a confirmation link to{" "}
        <span className="font-medium text-ink">{email || "your inbox"}</span>.
        Open it to activate your account, then sign in.
      </p>
      {email ? (
        <form action={resendSignupConfirmation} className="mt-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={nextPath} />
          <button
            type="submit"
            className="min-h-11 text-[13px] font-semibold text-[#1a5c51] underline-offset-2 hover:underline"
          >
            Resend confirmation email
          </button>
        </form>
      ) : (
        <form action={resendSignupConfirmation} className="mt-3 space-y-2">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="sr-only">Email for resend</span>
            <Input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Email used to sign up"
              className="h-11"
            />
          </label>
          <button
            type="submit"
            className="min-h-11 text-[13px] font-semibold text-[#1a5c51] underline-offset-2 hover:underline"
          >
            Resend confirmation email
          </button>
        </form>
      )}
    </StatusMessage>
  );
}
