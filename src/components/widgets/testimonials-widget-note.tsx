import Link from "next/link";

export function TestimonialsWidgetNote() {
  return (
    <div className="rounded-2xl border border-line bg-surface px-5 py-4">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
        Testimonials widget
      </p>
      <p className="mt-1 max-w-2xl text-[13px] text-muted">
        Reorder, layout, and theme for client quotes live in Testimonials.
        Embed snippets for your site are below once you have published quotes.
      </p>
      <Link
        href="/dashboard/testimonials"
        className="mt-3 inline-flex h-9 items-center rounded-full border border-line bg-paper px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-surface"
      >
        Manage testimonials
      </Link>
    </div>
  );
}
