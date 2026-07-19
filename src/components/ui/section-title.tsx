type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: Props) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
    </div>
  );
}
