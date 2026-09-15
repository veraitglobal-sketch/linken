import Link from "next/link";
import { signOutTo } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

type Props = { email: string; next: string; staff?: boolean };

export function LoginAlreadySignedIn({ email, next, staff }: Props) {
  return (
    <div className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10 lg:px-16">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#1a5c51] uppercase">
        Already signed in
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.035em] text-ink">
        You’re signed in
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
        Active account: <span className="font-semibold text-ink">{email}</span>.
        {staff
          ? " Continue, or sign out to use a different account."
          : " To confirm an invite sent to a different inbox, sign out first, then sign in with that email."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href={next} className="h-11 px-6">
          Continue
        </Button>
        <form action={signOutTo}>
          <input type="hidden" name="next" value={next} />
          <Button type="submit" variant="secondary" className="h-11 w-full px-6">
            Sign out and switch account
          </Button>
        </form>
      </div>
      {staff ? null : (
        <p className="mt-6 text-[13px] text-muted">
          Opened from Zoho or Mail? Use the same browser tab — or{" "}
          <Link
            href={next}
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            return to your invite link
          </Link>
          .
        </p>
      )}
    </div>
  );
}
