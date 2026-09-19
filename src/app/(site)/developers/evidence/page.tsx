import type { Metadata } from "next";
import { EvidenceDoc } from "@/components/developers/evidence-doc";

export const metadata: Metadata = {
  title: "Evidence binding",
  description:
    "How to bind Hansala confirmed records: stable id plus confirmed_at. generated_at is not proof.",
};

export default function EvidencePage() {
  return <EvidenceDoc />;
}
