type Props = { scope: string; services: string[] };

export function DossierScope({ scope, services }: Props) {
  const items = scope
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!items.length && !services.length) return null;

  return (
    <section className="rounded-[24px] border border-line bg-paper/60 p-6 sm:p-8">
      <p className="font-mono text-[11px] tracking-[0.18em] text-ember uppercase">
        Scope manifest
      </p>
      {items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {items.map((item, i) => (
            <li key={item} className="flex gap-4 text-[15px] text-ink-soft">
              <span className="font-mono text-[12px] text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {services.length > 0 ? (
        <p className="mt-5 border-t border-line pt-5 text-[13px] text-muted">
          Services · {services.join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
