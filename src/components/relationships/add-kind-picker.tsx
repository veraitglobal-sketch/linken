import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  RELATIONSHIP_KINDS,
  type RelationshipKind,
} from "@/features/relationships/kinds";

export function AddKindPicker({ active }: { active: RelationshipKind | null }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {RELATIONSHIP_KINDS.map((kind) => {
        const on = active === kind.id;
        return (
          <li key={kind.id}>
            <Link
              href={`/dashboard/add?kind=${kind.id}`}
              className={cn(
                "block rounded-2xl border px-4 py-3.5 transition-colors",
                on
                  ? "border-navy/35 bg-navy text-on-navy"
                  : "border-line bg-surface hover:border-navy/20",
              )}
            >
              <p className={cn("text-[14px] font-semibold", on ? "text-on-navy" : "text-ink")}>
                {kind.label}
              </p>
              <p className={cn("mt-1 text-[12px] leading-relaxed", on ? "text-on-navy-muted" : "text-muted")}>
                {kind.body}
              </p>
              <p className={cn("mt-2 text-[11px] leading-relaxed", on ? "text-on-navy-muted" : "text-ink-soft")}>
                {kind.confirm}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
