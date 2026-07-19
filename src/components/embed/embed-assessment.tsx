type Strength = { label: string; count: number };

type Props = {
  name: string;
  wouldYes: number;
  wouldTotal: number;
  topStrengths: Strength[];
  profileUrl: string;
};

export function EmbedAssessment({
  name,
  wouldYes,
  wouldTotal,
  topStrengths,
  profileUrl,
}: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-line bg-white px-4 py-3.5 no-underline transition-colors hover:bg-paper"
    >
      <p className="text-[11px] font-semibold tracking-[0.12em] text-[#1f6b5c] uppercase">
        Client signals · {name}
      </p>
      <p className="mt-2 font-display text-[1.15rem] font-medium tracking-[-0.03em] text-ink">
        {wouldYes} of {wouldTotal} clients would work with them again
      </p>
      {topStrengths.length > 0 ? (
        <p className="mt-1.5 text-[12px] text-ink-soft">
          {topStrengths
            .slice(0, 3)
            .map((s) => `${s.label.toLowerCase()} (${s.count})`)
            .join(" · ")}
        </p>
      ) : null}
      <p className="mt-3 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
        Linken
      </p>
    </a>
  );
}
