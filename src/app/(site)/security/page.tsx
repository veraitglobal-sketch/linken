import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/legal-doc";
import { SecurityBody } from "@/components/legal/security-body";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Hansala security practices, what Verified means, and how to report issues.",
};

export default function SecurityPage() {
  return (
    <LegalDoc
      eyebrow="Trust"
      title="Security"
      updated="6 August 2026"
      currentPath="/security"
    >
      <SecurityBody />
    </LegalDoc>
  );
}
