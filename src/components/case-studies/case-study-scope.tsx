type Props = { scope: string };

export function CaseStudyScope({ scope }: Props) {
  const text = scope.trim();
  if (!text) return null;

  const items = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section className="rounded-[28px] border border-line bg-surface px-7 py-8 sm:px-9">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        What we delivered
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.035em] text-ink">
        Scope and deliverables
      </h2>
      {items.length > 1 ? (
        <ul className="mt-5 space-y-2.5">
          {items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-[15px] leading-relaxed text-ink-soft"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">{text}</p>
      )}
    </section>
  );
}
