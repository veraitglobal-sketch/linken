import { updatePassword } from "@/features/auth/reset-password-actions";
import { PasswordField } from "@/components/auth/password-field";
import { StatusMessage } from "@/components/a11y/status-message";
import { Button } from "@/components/ui/button";

export function UpdatePasswordForm({ error }: { error?: string }) {
  return (
    <div className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[420px]">
        <h1 className="font-display text-[34px] leading-tight font-semibold tracking-[-0.035em] text-ink">
          Choose a new password
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          At least 6 characters. You can show what you type.
        </p>
        {error ? (
          <StatusMessage tone="alert" className="mt-4">
            {error}
          </StatusMessage>
        ) : null}
        <form action={updatePassword} className="mt-6 flex flex-col gap-4">
          <PasswordField
            name="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
          <PasswordField
            label="Confirm password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Type it again"
            required
            minLength={6}
          />
          <Button type="submit" className="mt-2 h-12 w-full !rounded-full !bg-navy text-[15px] hover:!bg-navy-deep">
            Save password
          </Button>
        </form>
      </div>
    </div>
  );
}
