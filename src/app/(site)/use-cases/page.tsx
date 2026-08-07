import type { Metadata } from "next";
import Link from "next/link";
import { listUseCases } from "@/features/seo/use-cases/catalog";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Use cases",
  description:
    "How teams use Hansala for confirmed client references, project portfolios, tenders, supplier diligence, and sector-specific proof — without thin SEO filler.",
  alternates: { canonical: `${getSiteUrl()}/use-cases` },
};

export default function UseCasesIndexPage() {
  const pages = listUseCases();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
        Use cases
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
        Confirmed proof for high-intent work
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">
        Each page explains a real buying or diligence job. We do not generate
        empty industry doorways — only guidance tied to mutual confirmation,
        domain verification, and public profiles that omit pending claims.
      </p>
      <ul className="mt-10 space-y-4">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/use-cases/${page.slug}`}
              className="block rounded-2xl border border-line bg-surface px-5 py-5 transition-colors hover:border-ink/20"
            >
              <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                {page.eyebrow}
              </p>
              <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
                {page.title}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                {page.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
