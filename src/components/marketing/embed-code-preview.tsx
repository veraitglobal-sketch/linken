import { NetworkMark } from "@/components/marketing/network-mark";

/** Quiet Verified lockup — product proof under the highlights story. */
export function EmbedCodePreview() {
  return (
    <div className="mt-8 inline-flex items-center gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-[0_8px_28px_rgba(8,20,18,0.05)]">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(165deg,#15302a_0%,#081412_100%)] text-[#8fc9b3] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
        <NetworkMark size={19} animate={false} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">
          Hansala
        </span>
        <span className="mt-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#1a5c51] uppercase">
          Verified
        </span>
      </span>
    </div>
  );
}
