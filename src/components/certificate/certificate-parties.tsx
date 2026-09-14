import Link from "next/link";
import { CertificateMark } from "@/components/certificate/certificate-mark";
import { NetworkMark } from "@/components/marketing/network-mark";
import { partyHost, partyPlace } from "@/features/certificate/format";
import { companyPath } from "@/features/seo/paths";
import type { CertificateParty } from "@/features/certificate/queries";

function PartyBlock({ party }: { party: CertificateParty }) {
  const place = partyPlace(party);
  const host = partyHost(party.website);
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <CertificateMark
        name={party.name}
        initials={party.logoInitials}
        logoUrl={party.logoUrl}
      />
      <Link
        href={companyPath(party.slug)}
        className="mt-5 font-display text-[1.75rem] leading-[1.08] font-medium tracking-[-0.045em] text-balance text-ink hover:underline print:no-underline sm:text-[2.15rem]"
      >
        {party.name}
      </Link>
      <p className="mt-2 text-[11px] font-semibold tracking-[0.16em] text-navy/55 uppercase">
        {party.category || "Company"}
      </p>
      {place ? <p className="mt-1 text-[13px] text-ink-soft">{place}</p> : null}
      {host ? <p className="mt-0.5 text-[12px] text-muted">{host}</p> : null}
      {party.services[0] ? (
        <p className="mt-1 text-[12px] text-muted">
          {party.services.slice(0, 2).join(" · ")}
        </p>
      ) : null}
      {party.verified ? (
        <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
          Domain verified
        </p>
      ) : null}
    </div>
  );
}

export function CertificateParties({
  left,
  right,
}: {
  left: CertificateParty;
  right: CertificateParty;
}) {
  return (
    <div className="flex items-start justify-between gap-2 sm:gap-6">
      <PartyBlock party={left} />
      <div
        className="flex shrink-0 items-center gap-2 pt-8 text-navy/40 sm:gap-3 sm:pt-10"
        aria-hidden
      >
        <span className="hidden h-px w-8 bg-current sm:block sm:w-12" />
        <NetworkMark size={22} animate={false} className="text-navy/70" />
        <span className="hidden h-px w-8 bg-current sm:block sm:w-12" />
      </div>
      <PartyBlock party={right} />
    </div>
  );
}
