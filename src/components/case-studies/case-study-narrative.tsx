type Block = {
  label: string;
  body: string;
};

type Props = {
  challenge: string;
  outcome: string;
  process: string;
  clientConfirmed?: boolean;
};

function NarrativeBlock({ label, body }: Block) {
  if (!body.trim()) return null;
  const paragraphs = body.split("\n").filter(Boolean);
  const lead = paragraphs[0] ?? body;
  const rest = paragraphs.slice(1);

  return (
    <section className="rounded-[28px] border border-line bg-surface p-7 shadow-[0_8px_28px_rgba(8,20,18,0.03)] sm:p-9">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-ember uppercase">
        {label}
      </p>
      <p className="mt-4 font-display text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-snug tracking-[-0.03em] text-ink">
        {lead}
      </p>
      {rest.length > 0 ? (
        <div className="mt-5 space-y-4 text-[15px] leading-[1.75] text-ink-soft">
          {rest.map((para) => (
            <p key={para.slice(0, 48)}>{para}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function CaseStudyNarrative({
  challenge,
  outcome,
  process,
  clientConfirmed = false,
}: Props) {
  const blocks = [
    { label: "The challenge", body: challenge },
    { label: "The outcome", body: outcome },
    { label: "How we delivered", body: process },
  ].filter((b) => b.body.trim());

  if (blocks.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="mb-2 px-0.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          The story
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.035em] text-ink">
          What was built, and why it mattered.
        </h2>
        <p className="mt-2 text-[13px] text-muted">
          {clientConfirmed
            ? "Narrative by the publisher — client confirmed the delivery separately."
            : "Self-reported narrative — invite the client to confirm on Hansala."}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {blocks.map((block) => (
          <NarrativeBlock key={block.label} {...block} />
        ))}
      </div>
    </section>
  );
}
