import Link from "next/link";
import { HomePanel } from "@/components/dashboard/home/home-panel";
import type { ProfileCompleteness } from "@/features/dashboard/profile-completeness";

export function HomeCompleteness({ data }: { data: ProfileCompleteness }) {
  if (data.complete) return null;

  return (
    <HomePanel label="Profile" meta={`${data.score}/${data.total}`}>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-navy"
          style={{ width: `${Math.round((data.score / data.total) * 100)}%` }}
        />
      </div>
      <ul className="mt-3 divide-y divide-line/80">
        {data.fields
          .filter((f) => !f.done)
          .map((f) => (
            <li key={f.id}>
              <Link
                href={f.href}
                className="flex h-10 items-center text-[13px] font-medium text-ink"
              >
                {f.label}
              </Link>
            </li>
          ))}
      </ul>
    </HomePanel>
  );
}
