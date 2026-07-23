"use client";

import Link from "next/link";
import { useState } from "react";
import { createCaseStudyWithConfirm } from "@/features/case-studies/actions";

type Props = {
  companySlug: string;
  companyName: string;
  error?: string | null;
};

export function OpenDossierFlow({ companySlug, companyName, error }: Props) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [partnerSlug, setPartnerSlug] = useState("");

  const canIssue = title.trim() && summary.trim() && email.includes("@");

  return (
    <div className="case-file min-h-[calc(100dvh-2.75rem)]">
      <div className="mx-auto grid max-w-6xl px-6 py-12 lg:grid-cols-[1fr_340px] lg:gap-16 lg:py-16">
        <div>
          <Link
            href="/dashboard/cases"
            className="text-[13px] text-[var(--cf-muted)] hover:text-[var(--cf-ink)]"
          >
            ← Case files
          </Link>

          <h1 className="mt-10 font-display text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.045em] text-[var(--cf-ink)]">
            New case file
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--cf-muted)]">
            Start with a title and a hook. You&apos;ll add photography and the full
            record in the editor — then the client confirms.
          </p>

          {error ? (
            <p className="mt-6 border-l-2 border-ember pl-4 text-[14px] text-ink">{error}</p>
          ) : null}

          <form action={createCaseStudyWithConfirm} className="mt-12 space-y-10">
            <input type="hidden" name="company_slug" value={companySlug} />
            <input type="hidden" name="back" value="/dashboard/cases/new" />
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="summary" value={summary} />
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="location" value={location} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="partner_slug" value={partnerSlug} />

            <label className="block">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
                Title
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vienna HQ fit-out"
                className="case-file-input mt-3"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
                Summary
              </span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder="One paragraph. Why this work matters."
                className="case-file-body-input mt-3"
              />
            </label>

            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
                  Year
                </span>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-3 w-full border-0 border-b border-[var(--cf-line)] bg-transparent py-2 text-[15px] focus:border-[var(--cf-accent)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
                  Location
                </span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Vienna, AT"
                  className="mt-3 w-full border-0 border-b border-[var(--cf-line)] bg-transparent py-2 text-[15px] focus:border-[var(--cf-accent)] focus:outline-none"
                />
              </label>
            </div>

            <label className="block border-t border-[var(--cf-line)] pt-10">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
                Client email
              </span>
              <p className="mt-1 text-[13px] text-[var(--cf-muted)]">
                They&apos;ll confirm the project — that&apos;s what makes this a case file,
                not a blog post.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="mt-4 w-full border-0 border-b border-[var(--cf-line)] bg-transparent py-2.5 text-[15px] focus:border-[var(--cf-accent)] focus:outline-none"
              />
              <input
                value={partnerSlug}
                onChange={(e) => setPartnerSlug(e.target.value)}
                placeholder="Partner slug (optional)"
                className="mt-4 w-full border-0 border-b border-[var(--cf-line)] bg-transparent py-2 text-[13px] text-[var(--cf-muted)] focus:border-[var(--cf-accent)] focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={!canIssue}
              className="inline-flex h-12 items-center border border-[var(--cf-ink)] bg-[var(--cf-ink)] px-8 text-[13px] font-semibold text-white transition-opacity disabled:opacity-30"
            >
              Create &amp; continue →
            </button>
          </form>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-8 border border-[var(--cf-line)] bg-white p-6">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
              Preview
            </p>
            <p className="mt-4 font-display text-xl font-medium leading-snug tracking-[-0.03em] text-[var(--cf-ink)]">
              {title.trim() || "Project title"}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--cf-muted)]">
              {summary.trim() || "Your summary will appear on the public case file."}
            </p>
            <hr className="case-file-rule my-6" />
            <p className="text-[12px] text-[var(--cf-muted)]">
              {companyName}
              {year ? ` · ${year}` : ""}
              {location ? ` · ${location}` : ""}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
