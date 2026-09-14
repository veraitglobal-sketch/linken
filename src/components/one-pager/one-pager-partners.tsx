import type { Partner } from "@/types/partner";

export function OnePagerPartners({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;
  const shown = partners.slice(0, 8);
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-medium tracking-[-0.03em]">
        Confirmed partners
      </h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {shown.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-baseline justify-between gap-2 py-3"
          >
            <div>
              <p className="text-[15px] font-medium text-ink">{p.name}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                {[p.category, p.city].filter(Boolean).join(" · ")}
              </p>
            </div>
            {p.verified ? (
              <p className="text-[12px] text-muted">Domain verified</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
