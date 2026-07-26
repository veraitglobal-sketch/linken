import { signOutTo } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function ConfirmSwitchAccount({
  next,
  title,
  body,
}: {
  next: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-line/80 bg-surface px-5 py-8 text-center shadow-[0_12px_36px_rgba(8,20,18,0.05)] sm:px-7">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
      <form action={signOutTo} className="mt-6">
        <input type="hidden" name="next" value={next} />
        <Button type="submit" className="h-11 w-full sm:w-auto sm:px-6">
          Sign out and continue
        </Button>
      </form>
    </div>
  );
}

export function ConfirmErrorNote({ children }: { children: string }) {
  return (
    <p className="mb-4 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
      {children}
    </p>
  );
}

export function ConfirmStatus({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
    </div>
  );
}
