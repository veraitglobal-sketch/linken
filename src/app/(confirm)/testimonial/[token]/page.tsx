import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmPage } from "@/components/confirm/confirm-page";
import { TestimonialPanel } from "@/components/testimonials/testimonial-panel";
import { getTestimonialByToken } from "@/features/testimonials/token-queries";

export const metadata: Metadata = {
  title: "Share a testimonial",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; done?: string }>;
};

export default async function TestimonialTokenPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error, done } = await searchParams;
  const view = await getTestimonialByToken(token);

  if (!view) {
    return (
      <section className="mx-auto max-w-lg py-10 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Invalid link
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This testimonial link is invalid or has expired.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-ink underline"
        >
          Back to Hansala
        </Link>
      </section>
    );
  }

  return (
    <ConfirmPage
      eyebrow="Hansala · Testimonial"
      title={view.status === "published" ? "Your testimonial" : "Share your experience"}
      subtitle={`For ${view.companyName}`}
    >
      <TestimonialPanel view={view} token={token} error={error} done={done} />
    </ConfirmPage>
  );
}
