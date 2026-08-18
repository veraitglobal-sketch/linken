import Link from "next/link";
import type { ProfileCompleteness } from "@/features/dashboard/profile-completeness";

export function HomeCompleteness({ data }: { data: ProfileCompleteness }) {
  if (data.complete) return null;

  return (
    <section className="rounded-[20px] border border-line bg-surface px-5 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[16px] font-medium tracking-[-0.02em] text-ink">
          Profile
        </h2>
        <p className="text-[12px] tabular-nums text-muted">
          {data.score}/{data.total}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-navy"
          style={{ width: `${Math.round((data.score / data.total) * 100)}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {data.fields
          .filter((f) => !f.done)
          .map((f) => (
            <li key={f.id}>
              <Link
                href={f.href}
                className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
              >
                Add {f.label.toLowerCase()} →
              </Link>
            </li>
          ))}
      </ul>
    </section>
  );
}
