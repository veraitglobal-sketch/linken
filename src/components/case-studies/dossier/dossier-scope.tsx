type Props = { scope: string; services: string[] };

export function DossierScope({ scope, services }: Props) {
  const items = scope.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (!items.length && !services.length) return null;

  return (
    <section className="mt-12 border-t border-[var(--cf-line)] pt-10">
      <h2 className="text-[11px] font-semibold tracking-[0.16em] text-[var(--cf-muted)] uppercase">
        Delivered
      </h2>
      {items.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {items.map((item) => (
            <li key={item} className="case-file-prose text-[16px]">
              — {item}
            </li>
          ))}
        </ul>
      ) : null}
      {services.length > 0 ? (
        <p className="mt-6 text-[14px] text-[var(--cf-muted)]">{services.join(" · ")}</p>
      ) : null}
    </section>
  );
}
