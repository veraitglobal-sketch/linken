import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { LogoMark } from "@/components/ui/logo-mark";
import type { OnePagerData } from "@/features/one-pager/queries";

type Props = {
  data: OnePagerData;
  profileUrl: string;
  qrDataUri: string;
};

function period(ref: OnePagerData["references"][number]) {
  if (ref.ongoing) return `Since ${ref.startedYear || "—"} · ongoing`;
  if (ref.endedYear) return `${ref.startedYear || "—"} – ${ref.endedYear}`;
  return ref.startedYear || "—";
}

export function OnePagerDocument({ data, profileUrl, qrDataUri }: Props) {
  const { company, assessment } = data;
  const accepting = company.acceptingClients !== false;
  const totalRefs = data.confirmedReferences + data.ongoingReferences;
  const showWould = assessment.wouldWorkAgainTotal >= 3;
  const top3 = assessment.topStrengths.slice(0, 3);

  return (
    <article className="one-pager mx-auto max-w-[210mm] bg-white px-8 py-10 text-ink sm:px-12 sm:py-12">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-8">
        <div className="flex items-start gap-4">
          <LogoMark
            initials={company.logoInitials}
            logoUrl={company.logoUrl}
            size="lg"
            className={
              company.logoUrl
                ? "rounded-xl border-[#0e1f1c]/15"
                : "rounded-xl border-[#0e1f1c]/15 bg-[#0e1f1c] text-white"
            }
          />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1a5c51] uppercase">
              Verified one-pager
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
              {company.name}
            </h1>
            <p className="mt-2 text-[14px] text-ink-soft">
              {company.category}
              {company.city ? ` · ${company.city}` : ""}
              {company.country ? `, ${company.country}` : ""}
            </p>
            {company.website ? (
              <p className="mt-1 text-[13px] text-muted">{company.website}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TrustLevelBadge level={data.trustLevel} />
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase ${
                  accepting
                    ? "border-[#1a5c51]/30 bg-[#1a5c51]/8 text-[#1a5c51]"
                    : "border-line bg-paper text-muted"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    accepting ? "bg-[#7eb8a4]" : "bg-muted"
                  }`}
                />
                {accepting ? "Accepting new clients" : "Fully booked"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <Stat
          label="Confirmed partners"
          value={String(data.confirmedPartners)}
        />
        <Stat
          label="Confirmed client references"
          value={`${totalRefs}${data.ongoingReferences ? ` · ${data.ongoingReferences} ongoing` : ""}`}
        />
        {showWould ? (
          <Stat
            label="Would work again"
            value={`${assessment.wouldWorkAgainYes} of ${assessment.wouldWorkAgainTotal}`}
          />
        ) : null}
        {top3.length > 0 ? (
          <Stat
            label="Clients highlight"
            value={top3.map((s) => s.label.toLowerCase()).join(" · ")}
          />
        ) : null}
      </section>

      {data.references.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-medium tracking-[-0.03em]">
            Confirmed references
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {data.references.map((ref) => (
              <li
                key={ref.id}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3"
              >
                <div>
                  <p className="text-[15px] font-medium text-ink">
                    {ref.clientName}
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-soft">{ref.service}</p>
                </div>
                <p className="text-[12px] text-muted">{period(ref)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.caseStudies.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-medium tracking-[-0.03em]">
            Confirmed case studies
          </h2>
          <ul className="mt-4 space-y-4">
            {data.caseStudies.map((cs) => (
              <li key={cs.title + cs.year}>
                <p className="text-[15px] font-medium text-ink">
                  {cs.title}
                  {cs.year ? (
                    <span className="font-normal text-muted"> · {cs.year}</span>
                  ) : null}
                </p>
                {cs.summary ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    {cs.summary}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-line pt-8">
        <div className="max-w-md">
          <p className="font-display text-lg tracking-[-0.03em] text-ink">
            linken.com/
            <span className="text-[#1a5c51]">{company.slug}</span>
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Scan to verify — every item on this page is confirmed by the other
            party on Linken.
          </p>
          <p className="mt-2 text-[12px] text-muted">{profileUrl}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUri}
          alt="QR code to verify this company on Linken"
          width={140}
          height={140}
          className="rounded-xl border border-line"
        />
      </footer>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-[#f7f8fa] px-4 py-3.5">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-1.5 font-display text-lg tracking-[-0.03em] text-ink">
        {value}
      </p>
    </div>
  );
}
