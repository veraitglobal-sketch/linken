import { COMPANY_SHARE_PREFIX } from "@/lib/site";

type Props = {
  slug: string;
  profileUrl: string;
  qrDataUri: string;
  branded: boolean;
};

export function OnePagerFoot({ slug, profileUrl, qrDataUri, branded }: Props) {
  return (
    <>
      <footer className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-line pt-8">
        <div className="max-w-md">
          <p className="font-display text-lg tracking-[-0.03em] text-ink">
            {COMPANY_SHARE_PREFIX}/
            <span className="text-[#1a5c51]">{slug}</span>
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Scan to verify — every item on this page is confirmed by the other
            party on Hansala.
          </p>
          <p className="mt-2 text-[12px] text-muted">{profileUrl}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUri}
          alt="QR code to verify this company on Hansala"
          width={140}
          height={140}
          className="rounded-xl border border-line"
        />
      </footer>
      <p className="mt-8 border-t border-line pt-4 text-center text-[11px] tracking-[0.08em] text-muted uppercase">
        {branded ? "Confirmed on Hansala" : "Generated with Hansala"}
      </p>
    </>
  );
}
