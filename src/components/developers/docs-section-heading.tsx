type Props = {
  index: string;
  title: string;
  description?: string;
};

export function DocsSectionHeading({ index, title, description }: Props) {
  return (
    <div className="max-w-[42rem]">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[13px] tracking-[0.08em] text-muted">
          {index}
        </span>
        <h2 className="font-display text-[clamp(1.65rem,2.4vw,2.05rem)] font-medium tracking-[-0.035em] text-ink">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
    </div>
  );
}
