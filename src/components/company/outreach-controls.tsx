import { updateOutreachPreferences } from "@/features/growth/outreach-actions";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  inviteRemindersEnabled: boolean;
};

/** Operator controls for reminders — no dark patterns, opt-out respected. */
export function OutreachControls({
  companySlug,
  inviteRemindersEnabled,
}: Props) {
  return (
    <section className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        Outreach
      </p>
      <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Invite reminders
      </h2>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft">
        When off, your team cannot resend claim or confirmation reminders.
        Daily caps and cooldowns still apply when reminders are on. We never
        send invites without an explicit action.
      </p>
      <form action={updateOutreachPreferences} className="mt-5 space-y-4">
        <input type="hidden" name="company_slug" value={companySlug} />
        <label className="flex items-start gap-2 text-[14px] text-ink">
          <input
            type="checkbox"
            name="invite_reminders"
            value="1"
            defaultChecked={inviteRemindersEnabled}
            className="mt-1"
          />
          <span>Allow reminder emails for pending invites</span>
        </label>
        <Button type="submit" variant="secondary" className="h-10 px-4">
          Save outreach settings
        </Button>
      </form>
    </section>
  );
}
