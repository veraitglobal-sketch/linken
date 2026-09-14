import type { SharedCase } from "@/features/certificate/shared-cases";

export function CertificateCases({ cases }: { cases: SharedCase[] }) {
  if (cases.length === 0) return null;
  return (
    <section className="mt-8 border-t border-navy/15 pt-6">
      <p className="text-center text-[10px] font-semibold tracking-[0.16em] text-navy/45 uppercase">
        Shared work
      </p>
      <ul className="mt-3 space-y-1.5 text-center">
        {cases.map((c) => (
          <li
            key={`${c.ownerSlug}-${c.slug}`}
            className="text-[13px] text-ink-soft"
          >
            {c.title}
            {c.year ? <span className="text-muted"> · {c.year}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
