import { HomePill, HomeTitle } from "@/components/marketing/home-section";

/** Homepage close — light and centred: one claim, one line, two pills. */
export function HomeClose() {
  return (
    <section className="px-4 pt-14 pb-24 text-center sm:px-[18px] sm:pt-[75px] sm:pb-[150px]">
      <HomeTitle className="mx-auto max-w-[720px]">
        Put your confirmed network on the record.
      </HomeTitle>
      <p className="mx-auto mt-6 max-w-[723px] text-[18px] leading-relaxed text-ink-soft">
        Create your company profile. Invite the partners you worked with.
        Publish only what both sides confirm.
      </p>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <HomePill href="/onboarding">Create your free profile</HomePill>
        <HomePill href="/demo" tone="outline">
          See a live example
        </HomePill>
      </div>
    </section>
  );
}
