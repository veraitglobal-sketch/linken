import { requestClaimInviteResend } from "@/features/partners/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  claimSent?: boolean;
  claimError?: string;
};

/** Public CTA — never exposes claim_token. Email match triggers a fresh invite. */
export function UnclaimedBanner({ company, claimSent, claimError }: Props) {
  return (
    <section id="claim" className="mx-auto mt-4 max-w-[calc(1280px+2.25rem)] scroll-mt-24 px-4 sm:px-[18px]">
      <div className="rounded-[24px] bg-lime-soft px-5 py-6 ring-1 ring-lime sm:px-8">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">
          Unclaimed profile
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.4rem,2.5vw,1.85rem)] font-semibold tracking-[-0.03em] text-ink">
          Is this your company?
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          {company.createdByName
            ? `${company.createdByName} created this draft when listing you as a partner. `
            : "A partner created this draft profile for your firm. "}
          Enter the invite email to receive a private claim link.
        </p>

        {claimSent ? (
          <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm text-ink ring-1 ring-line/70">
            If that email matches the invite on file, we sent a claim link.
          </p>
        ) : null}
        {claimError ? (
          <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm text-ink ring-1 ring-line">
            {claimError}
          </p>
        ) : null}

        {!claimSent ? (
          <form
            action={requestClaimInviteResend}
            className="mt-5 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="slug" value={company.slug} />
            <label className="block min-w-0 flex-1">
              <span className="mb-1.5 block text-[12px] font-medium text-ink">
                Invite email
              </span>
              <Input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
              />
            </label>
            <Button type="submit" className="h-12 shrink-0 rounded-full! bg-navy! px-5 hover:bg-navy-deep!">
              Send claim link
            </Button>
          </form>
        ) : null}

        <p className="mt-5 text-[12px] text-ink-soft">
          <a
            href={`mailto:hello@hansala.com?subject=${encodeURIComponent(
              `Remove unclaimed profile: ${company.name} (${company.slug})`,
            )}&body=${encodeURIComponent(
              `Hi Hansala,\n\nThis unclaimed profile appears to be about my company and I would like it removed.\n\nProfile: ${company.slug}\n\nThanks.`,
            )}`}
            className="underline-offset-2 hover:underline"
          >
            Is this profile about your company and you want it removed? Contact
            us
          </a>
        </p>
      </div>
    </section>
  );
}
