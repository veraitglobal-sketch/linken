import Link from "next/link";
import {
  submitTestimonialForm,
  withdrawTestimonialForm,
} from "@/features/testimonials/submit-actions";
import type { TestimonialTokenView } from "@/features/testimonials/token-queries";

type Props = {
  view: TestimonialTokenView;
  token: string;
  error?: string;
  done?: string;
};

export function TestimonialPanel({ view, token, error, done }: Props) {
  const published = view.status === "published";
  const justPublished = done === "published";
  const withdrawn = done === "withdrawn" || view.status === "withdrawn";

  if (withdrawn) {
    return (
      <div className="rounded-2xl border border-line bg-surface px-6 py-8 text-center">
        <p className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
          Testimonial withdrawn
        </p>
        <p className="mt-2 text-[14px] text-ink-soft">
          This testimonial is no longer shown on {view.companyName}&apos;s profile.
        </p>
      </div>
    );
  }

  if (published && justPublished) {
    return (
      <div className="rounded-2xl border border-line bg-surface px-6 py-8 text-center">
        <p className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
          Thank you
        </p>
        <p className="mt-2 text-[14px] text-ink-soft">
          Your words are now live on {view.companyName}&apos;s Hansala profile.
        </p>
        <Link
          href={`/c/${view.companySlug}`}
          className="mt-6 inline-block text-sm font-semibold text-ink underline"
        >
          View profile
        </Link>
      </div>
    );
  }

  if (published) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-surface px-6 py-8">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Published
          </p>
          <blockquote className="mt-4 font-display text-[1.25rem] leading-snug tracking-[-0.03em] text-ink">
            &ldquo;{view.body}&rdquo;
          </blockquote>
          <p className="mt-4 text-[14px] text-ink-soft">
            — {view.authorName}
            {view.authorRole ? `, ${view.authorRole}` : ""}
          </p>
        </div>
        <form action={withdrawTestimonialForm}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="text-[13px] text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Withdraw this testimonial
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={submitTestimonialForm} className="space-y-5">
      {error ? (
        <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <input type="hidden" name="token" value={token} />
      {view.authorCompanyId ? (
        <input type="hidden" name="author_company_id" value={view.authorCompanyId} />
      ) : null}

      <label className="block">
        <span className="text-[13px] font-medium text-ink">Your testimonial</span>
        <textarea
          name="body"
          required
          rows={6}
          defaultValue={view.body}
          placeholder="Share your experience working with them…"
          className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] text-ink outline-none ring-ink/10 focus:ring-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-medium text-ink">Your name</span>
          <input
            name="author_name"
            required
            defaultValue={view.authorName}
            className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-[15px] text-ink outline-none ring-ink/10 focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-ink">Your role</span>
          <input
            name="author_role"
            defaultValue={view.authorRole}
            placeholder="e.g. Project Director"
            className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-[15px] text-ink outline-none ring-ink/10 focus:ring-2"
          />
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3">
        <input
          name="consent_public"
          type="checkbox"
          required
          defaultChecked={view.consentPublic}
          className="mt-1"
        />
        <span className="text-[13px] leading-relaxed text-ink-soft">
          I consent to this testimonial being shown publicly on {view.companyName}&apos;s
          Hansala profile. I can withdraw it at any time.
        </span>
      </label>

      <button
        type="submit"
        className="w-full rounded-xl bg-ink px-4 py-3 text-[14px] font-semibold text-paper transition-opacity hover:opacity-90"
      >
        Publish testimonial
      </button>
    </form>
  );
}
