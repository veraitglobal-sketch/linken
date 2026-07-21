import { ImageResponse } from "next/og";
import { getCompanyForPage } from "@/features/companies/queries";
import { getTrustProfile } from "@/features/trust/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);

  if (!company) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0e1f1c",
            color: "white",
            fontSize: 48,
          }}
        >
          Hansala
        </div>
      ),
      { ...size },
    );
  }

  const trust = await getTrustProfile(company.id, company.slug);
  const partners = trust.breakdown.confirmedPartners;
  const clients =
    trust.breakdown.confirmedReferences + trust.breakdown.ongoingReferences;
  const hasCounts = partners > 0 || clients > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e1f1c",
          color: "white",
          padding: "64px 72px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#7eb8a4",
            }}
          />
          <span
            style={{
              fontSize: 22,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {company.category || "Company"}
            {company.city ? ` · ${company.city}` : ""}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              fontWeight: 500,
              maxWidth: 900,
            }}
          >
            {company.name}
          </div>
          {trust.level !== "Member" ? (
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontFamily: "system-ui, sans-serif",
                color: "#7eb8a4",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Hansala {trust.level}
            </div>
          ) : null}
          {hasCounts ? (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontFamily: "system-ui, sans-serif",
                color: "rgba(255,255,255,0.72)",
                marginTop: 8,
              }}
            >
              {partners > 0
                ? `${partners} confirmed partner${partners === 1 ? "" : "s"}`
                : ""}
              {partners > 0 && clients > 0 ? " · " : ""}
              {clients > 0
                ? `${clients} confirmed client${clients === 1 ? "" : "s"}`
                : ""}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontFamily: "system-ui, sans-serif",
                color: "rgba(255,255,255,0.65)",
                marginTop: 8,
              }}
            >
              on Hansala
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span
            style={{
              fontSize: 36,
              letterSpacing: "-0.03em",
              fontWeight: 600,
            }}
          >
            Hansala
          </span>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.45)" }}>
            hansala.com/{company.slug}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
