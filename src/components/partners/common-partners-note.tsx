import Link from "next/link";
import type { Partner } from "@/types/partner";

export function CommonPartnersNote({
  partners,
}: {
  partners: Partner[];
}) {
  if (partners.length === 0) return null;
  return (
    <aside className="border-b border-line bg-surface">
      <p className="mx-auto max-w-6xl px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
        You both confirmed{" "}
        {partners.map((p, i) => (
          <span key={p.id}>
            {i > 0 ? ", " : ""}
            <Link
              href={`/c/${p.slug}`}
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              {p.name}
            </Link>
          </span>
        ))}
        .
      </p>
    </aside>
  );
}
