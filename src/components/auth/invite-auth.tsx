import { signIn, signInWithGoogle, signUp } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  next: string;
  invitedEmail?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

/** Shared auth gate for claim + client-confirm flows. */
export function InviteAuth({
  next,
  invitedEmail,
  eyebrow = "Account required",
  title = "Sign in to continue",
  description = "Use the account that should own this company profile.",
}: Props) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mt-2 text-[14px] text-ink-soft">{description}</p>

      <form action={signInWithGoogle} className="mt-5">
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" className="h-11 w-full">
          Continue with Google
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[12px] text-muted">
        <span className="h-px flex-1 bg-line" />
        or email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={signIn} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <Input
          type="email"
          name="email"
          required
          placeholder="Email"
          defaultValue={invitedEmail}
        />
        <Input
          type="password"
          name="password"
          required
          minLength={6}
          placeholder="Password"
        />
        <Button type="submit" className="h-11">
          Sign in
        </Button>
      </form>

      <form action={signUp} className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
        <input type="hidden" name="next" value={next} />
        <p className="text-sm font-medium text-ink">New here? Create an account</p>
        <Input
          type="email"
          name="email"
          required
          placeholder="Email"
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
          Create account
        </Button>
      </form>
    </div>
  );
}
