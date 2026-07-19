type RefItem = {
  clientName: string;
  service: string;
  period: string;
};

type Props = {
  name: string;
  references: RefItem[];
  profileUrl: string;
};

export function EmbedReferences({ name, references, profileUrl }: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-line bg-white px-4 py-3.5 no-underline transition-colors hover:bg-paper"
    >
      <p className="text-[11px] font-semibold tracking-[0.12em] text-[#1f6b5c] uppercase">
        Confirmed references · {name}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {references.map((ref) => (
          <li key={`${ref.clientName}-${ref.service}`} className="text-[12px] text-ink-soft">
            <span className="font-medium text-ink">{ref.clientName}</span>
            {" · "}
            {ref.service}
            {" · "}
            <span className="text-muted">{ref.period}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
        Linken
      </p>
    </a>
  );
}
