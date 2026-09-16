import { ImageResponse } from "next/og";
import { getPartnershipCertificate } from "@/features/certificate/queries";
import { formatCertificateDate } from "@/features/certificate/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string; partnerSlug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug, partnerSlug } = await params;
  const data = await getPartnershipCertificate(slug, partnerSlug);
  if (!data) {
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
            fontSize: 42,
          }}
        >
          Hansala
        </div>
      ),
      { ...size },
    );
  }

  const when = formatCertificateDate(data.confirmedAt);

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
          padding: "56px 64px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 18,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#7eb8a4",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Confirmed on Hansala
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 48,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              fontWeight: 500,
            }}
          >
            {data.left.name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#7eb8a4",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            ↔
          </div>
          <div
            style={{
              fontSize: 48,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              fontWeight: 500,
            }}
          >
            {data.right.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "system-ui, sans-serif",
            fontSize: 20,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>Both sides accepted · {when}</span>
          <span>Hansala</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
