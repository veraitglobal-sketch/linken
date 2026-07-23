type Chapter = {
  num: string;
  label: string;
  body: string;
  tag: string;
};

type Props = {
  challenge: string;
  outcome: string;
  process: string;
  clientConfirmed: boolean;
};

export function DossierChapters({
  challenge,
  outcome,
  process,
  clientConfirmed,
}: Props) {
  const tag = clientConfirmed
    ? "Publisher record · client confirmed delivery"
    : "Publisher record · self-reported";

  const chapters: Chapter[] = [
    { num: "01", label: "The challenge", body: challenge, tag },
    { num: "02", label: "How it was delivered", body: process, tag },
    { num: "03", label: "The outcome", body: outcome, tag },
  ].filter((c) => c.body.trim());

  if (!chapters.length) return null;

  return (
    <section className="space-y-16">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-blue uppercase">
          The record
        </p>
        <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.04em] text-ink">
          Three chapters.<br />
          <span className="text-ink/30">One verified file.</span>
        </h2>
      </header>

      {chapters.map((ch, i) => (
        <article
          key={ch.num}
          className={`relative ${i === 1 ? "lg:ml-[12%]" : i === 2 ? "lg:mr-[8%]" : ""}`}
        >
          <span className="font-display text-[clamp(4rem,12vw,7rem)] font-medium leading-none tracking-[-0.06em] text-paper">
            {ch.num}
          </span>
          <div className="-mt-8 sm:-mt-12 lg:-mt-16">
            <p className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase">
              {ch.tag}
            </p>
            <h3 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium tracking-[-0.035em] text-ink">
              {ch.label}
            </h3>
            <div className="mt-5 max-w-2xl space-y-4 text-[16px] leading-[1.8] text-ink-soft">
              {ch.body.split("\n").filter(Boolean).map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
