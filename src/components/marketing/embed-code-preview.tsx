import { NetworkMark } from "@/components/marketing/network-mark";

/** Just the mark — no client logos, no proof strip. */
export function EmbedCodePreview() {
  return (
    <div className="mt-6 flex shrink-0 items-center gap-3">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(165deg,#15302a_0%,#081412_100%)] text-[#8fc9b3] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(8,20,18,0.1),0_12px_24px_-6px_rgba(8,20,18,0.4)] ring-1 ring-black/[0.04]">
        <NetworkMark size={21} animate={false} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">
          Hansala
        </span>
        <span className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-[#1a5c51] uppercase">
          Verified
        </span>
      </span>
    </div>
  );
}
