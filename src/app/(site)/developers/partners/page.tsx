import type { Metadata } from "next";
import { PartnerProgramClose } from "@/components/developers/partner-program-close";
import { PartnerProgramFacts } from "@/components/developers/partner-program-facts";
import { PartnerProgramHero } from "@/components/developers/partner-program-hero";
import { PartnerProgramSteps } from "@/components/developers/partner-program-steps";

export const metadata: Metadata = {
  title: "Developer partner program",
  description:
    "Earn 10% of paid Pro invoices from companies you refer to Hansala. Recurring commission — accrued when they pay.",
  alternates: { canonical: "/developers/partners" },
};

export default function DeveloperPartnersProgramPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PartnerProgramHero />
      <PartnerProgramSteps />
      <PartnerProgramFacts />
      <PartnerProgramClose />
    </div>
  );
}
