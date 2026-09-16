import { SignupCodeForm } from "@/components/auth/signup-code-form";
import { StatusMessage } from "@/components/a11y/status-message";
import { Input } from "@/components/ui/input";
import { resendSignupConfirmation } from "@/features/auth/actions";

export function LoginVerifyNotice({
  email,
  resent,
  nextPath,
  error,
}: {
  email?: string;
  resent?: string;
  nextPath: string;
  error?: string;
}) {
  return (
    <StatusMessage className="animate-rise mb-6 border-[#1a5c51]/25 bg-[#1a5c51]/8">
      <p className="text-[13px] font-semibold text-ink">
        {resent === "1" ? "New code sent" : "Check your email"}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
        We sent a 4-digit code to{" "}
        <span className="font-medium text-ink">{email || "your inbox"}</span>.
        Enter it to activate your account.
      </p>
      {email ? (
        <SignupCodeForm email={email} nextPath={nextPath} from="login" error={error} />
      ) : (
        <form action={resendSignupConfirmation} className="mt-3 space-y-2">
          <input type="hidden" name="next" value={nextPath} />
          <input type="hidden" name="from" value="login" />
          <label className="block">
            <span className="sr-only">Email for a new code</span>
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
            Send a new code
          </button>
        </form>
      )}
    </StatusMessage>
  );
}
