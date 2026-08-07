import {
  tokenClass,
  type CodeToken,
} from "@/components/developers/highlight";

type Props = {
  tokens: CodeToken[];
  className?: string;
};

/** Server-rendered highlighted pre — tokens produced by tokenize*. */
export function CodeBlock({ tokens, className }: Props) {
  return (
    <pre
      tabIndex={0}
      role="region"
      aria-label="Code sample"
      className={
        className ??
        "overflow-x-auto px-4 py-4 font-mono text-[12px] leading-relaxed"
      }
    >
      <code>
        {tokens.map((tok, i) => (
          <span key={`${i}-${tok.kind}`} className={tokenClass(tok.kind)}>
            {tok.text}
          </span>
        ))}
      </code>
    </pre>
  );
}
