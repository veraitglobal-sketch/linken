import { NetworkMark } from "@/components/marketing/network-mark";

export function CertificateLetterhead() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-navy/15 pb-5">
      <span className="inline-flex items-center gap-2 text-navy">
        <NetworkMark size={18} animate={false} className="shrink-0" />
        <span className="font-display text-[15px] font-medium tracking-[-0.03em]">
          Hansala
        </span>
      </span>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/50 uppercase">
        Partnership record
      </p>
    </header>
  );
}
