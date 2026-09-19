import Link from "next/link";
import { HomePill } from "@/components/marketing/home-section";
import { UseCaseHero } from "@/components/seo/use-case-hero";
import { getUseCase } from "@/features/seo/use-cases/catalog";
import type { UseCasePage } from "@/features/seo/use-cases/types";

export function UseCaseView({ page }: { page: UseCasePage }) {
  const related = page.relatedSlugs
    .map((slug) => getUseCase(slug))
    .filter((p): p is UseCasePage => p != null);

  return (
    <div className="home-wash bg-wash">
      <UseCaseHero page={page} />
      <article className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
        {page.sections.map((section) => (
          <section key={section.heading} className="mt-14">
            <h2 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] font-semibold tracking-[-0.03em] text-ink">
              {section.heading}
            </h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="mt-3 text-[16px] leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-14 rounded-hero bg-lime-soft px-7 py-8">
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
            Practical checklist
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-ink-soft">
            {page.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-hero bg-surface px-7 py-8 ring-1 ring-line/70">
          <h2 className="font-label text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
            What this is not
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-ink-soft">
            {page.notThis.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <HomePill href="/onboarding">Create a company profile</HomePill>
          <HomePill href="/pricing" tone="outline">
            View pricing
          </HomePill>
        </div>

        {related.length ? (
          <section className="mt-16 border-t border-line pt-10">
            <h2 className="font-label text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
              Related
            </h2>
            <ul className="mt-5 grid list-none gap-3 p-0 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/use-cases/${r.slug}`}
                    className="block rounded-card bg-surface px-5 py-5 ring-1 ring-line/70 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <span className="font-label text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                      {r.eyebrow}
                    </span>
                    <span className="mt-2 block font-display text-[18px] font-semibold tracking-[-0.025em] text-ink">
                      {r.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </div>
  );
}
