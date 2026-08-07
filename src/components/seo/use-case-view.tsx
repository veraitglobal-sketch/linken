import Link from "next/link";
import type { UseCasePage } from "@/features/seo/use-cases/types";
import { getUseCase } from "@/features/seo/use-cases/catalog";

type Props = {
  page: UseCasePage;
};

export function UseCaseView({ page }: Props) {
  const related = page.relatedSlugs
    .map((slug) => getUseCase(slug))
    .filter((p): p is UseCasePage => p != null);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
        {page.eyebrow}
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
        {page.headline}
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">{page.lede}</p>
      <p className="mt-4 text-[14px] text-muted">
        <span className="font-medium text-ink-soft">Who this is for. </span>
        {page.audience}
      </p>

      {page.sections.map((section) => (
        <section key={section.heading} className="mt-12">
          <h2 className="font-display text-[clamp(1.35rem,2.5vw,1.75rem)] font-medium tracking-[-0.03em] text-ink">
            {section.heading}
          </h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              {p}
            </p>
          ))}
        </section>
      ))}

      <section className="mt-12">
        <h2 className="font-display text-[clamp(1.35rem,2.5vw,1.75rem)] font-medium tracking-[-0.03em] text-ink">
          Practical checklist
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-ink-soft">
          {page.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-surface px-5 py-5">
        <h2 className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">
          What this is not
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] text-ink-soft">
          {page.notThis.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/onboarding"
          className="inline-flex rounded-full bg-navy px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          Create a company profile
        </Link>
        <Link
          href="/pricing"
          className="inline-flex rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-semibold text-ink"
        >
          View pricing
        </Link>
      </section>

      {related.length ? (
        <section className="mt-14 border-t border-line pt-8">
          <h2 className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">
            Related
          </h2>
          <ul className="mt-3 space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/use-cases/${r.slug}`}
                  className="text-[15px] font-medium text-ink underline-offset-2 hover:underline"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
