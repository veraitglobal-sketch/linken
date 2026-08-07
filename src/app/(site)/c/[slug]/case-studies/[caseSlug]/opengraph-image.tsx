import { ImageResponse } from "next/og";
import { getCaseStudyForPage } from "@/features/case-studies/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { companyShareLabel } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string; caseSlug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug, caseSlug } = await params;
  const [company, caseStudy] = await Promise.all([
    getCompanyForPage(slug),
    getCaseStudyForPage(slug, caseSlug),
  ]);

  const title = caseStudy?.title ?? "Case study";
  const subtitle = company
    ? companyShareLabel(company.slug)
    : "hansala.com";

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
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {company?.name ?? "Hansala"} · Case study
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            fontWeight: 500,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "system-ui, sans-serif",
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span style={{ color: "#7eb8a4", fontWeight: 600 }}>Hansala</span>
          <span>{subtitle}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
