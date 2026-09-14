import { formatCertificateDate } from "@/features/certificate/format";

type Props = {
  confirmedAt: string;
};

export function CertificateFacts({ confirmedAt }: Props) {
  return (
    <dl className="mt-10 grid grid-cols-2 border-y border-navy/15">
      <Fact label="Confirmed" value={formatCertificateDate(confirmedAt)} />
      <Fact label="Acceptance" value="Both sides accepted" />
    </dl>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-1 py-5 first:pr-6 last:border-l last:border-navy/15 last:pl-6 sm:py-6">
      <dt className="text-[11px] font-semibold tracking-[0.16em] text-navy/45 uppercase">
        {label}
      </dt>
      <dd className="mt-2 font-display text-[1.05rem] leading-snug tracking-[-0.03em] text-ink">
        {value}
      </dd>
    </div>
  );
}
