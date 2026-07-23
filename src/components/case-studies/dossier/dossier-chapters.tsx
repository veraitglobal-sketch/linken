type Props = {
  challenge: string;
  outcome: string;
  process: string;
  clientConfirmed: boolean;
};

export function DossierChapters({ challenge, outcome, process, clientConfirmed }: Props) {
  const chapters = [
    { label: "Challenge", body: challenge },
    { label: "Approach", body: process },
    { label: "Outcome", body: outcome },
  ].filter((c) => c.body.trim());

  if (!chapters.length) return null;

  return (
    <section className="mt-16 space-y-16">
      <header className="border-t border-[var(--cf-line)] pt-10">
        <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] text-[var(--cf-ink)]">
          The work
        </h2>
        <p className="mt-3 text-[14px] text-[var(--cf-muted)]">
          {clientConfirmed
            ? "Written by the firm. Delivery confirmed by the client."
            : "Written by the firm."}
        </p>
      </header>

      {chapters.map((ch, i) => (
        <article
          key={ch.label}
          className={i > 0 ? "border-t border-[var(--cf-line)] pt-12" : ""}
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#b8895a] uppercase">
            {ch.label}
          </p>
          <div className="case-file-prose mt-5">
            {ch.body.split("\n").filter(Boolean).map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
