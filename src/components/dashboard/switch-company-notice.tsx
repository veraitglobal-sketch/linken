import Link from "next/link";

/** Shown on company-only pages when the active workspace is a group. */
export function SwitchCompanyNotice({
  title = "Company workspace required",
}: {
  title?: string;
}) {
  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <h1 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Switch to a company workspace to use this page.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-semibold text-white"
      >
        Back to workspace
      </Link>
    </div>
  );
}
