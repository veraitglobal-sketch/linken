import type { Metadata } from "next";
import { UseCasesIndex } from "@/components/seo/use-cases-index";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Use cases",
  description:
    "How teams use Hansala for confirmed client references, project portfolios, tenders, supplier diligence, and sector-specific proof.",
  alternates: { canonical: `${getSiteUrl()}/use-cases` },
};

export default function UseCasesIndexPage() {
  return <UseCasesIndex />;
}
