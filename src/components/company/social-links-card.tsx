import { updateSocialLinks } from "@/features/company/social-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialIcons } from "@/components/ui/social-icons";

type Props = {
  linkedinUrl: string;
  facebookUrl: string;
  saved?: boolean;
};

export function SocialLinksCard({
  linkedinUrl,
  facebookUrl,
  saved = false,
}: Props) {
  return (
    <section
      id="social"
      className="scroll-mt-28 rounded-[24px] border border-line bg-surface px-5 py-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
            Social
          </p>
          <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
            LinkedIn & Facebook
          </h2>
          <p className="mt-1 max-w-md text-[13px] text-ink-soft">
            Shown as icons on your public profile. Leave blank to hide.
          </p>
        </div>
        <SocialIcons
          linkedinUrl={linkedinUrl || null}
          facebookUrl={facebookUrl || null}
          tone="light"
        />
      </div>

      {saved ? (
        <p className="mt-3 rounded-xl border border-[#1f6b5c]/25 bg-[#1f6b5c]/10 px-3 py-2 text-[13px] text-ink">
          Social links saved.
        </p>
      ) : null}

      <form action={updateSocialLinks} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            LinkedIn
          </span>
          <Input
            name="linkedin_url"
            type="url"
            defaultValue={linkedinUrl}
            placeholder="https://www.linkedin.com/company/…"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Facebook
          </span>
          <Input
            name="facebook_url"
            type="url"
            defaultValue={facebookUrl}
            placeholder="https://www.facebook.com/…"
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" className="h-10">
            Save social links
          </Button>
        </div>
      </form>
    </section>
  );
}
