import { CopyChip } from "@/components/developers/copy-chip";

type Props = {
  html: string;
  plain: string;
};

/** Paste into Gmail/Outlook. Not an iframe — mail clients strip those. */
export function EmailSignaturePanel({ html, plain }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-surface px-5 py-4">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
        Email signature
      </p>
      <p className="mt-1 max-w-2xl text-[13px] text-muted">
        Static HTML for Gmail and Outlook. The check mark and record link stay
        visible. Website widgets are below.
      </p>
      <div
        className="mt-4 overflow-x-auto rounded-xl border border-line bg-paper px-4 py-3"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyChip value={html} label="Copy HTML" />
        <CopyChip value={plain} label="Copy plain text" />
      </div>
    </section>
  );
}
