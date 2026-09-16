import { ProfileIcons, ProfileSection } from "@/components/company/profile-section";
import { AddReferenceForm } from "@/components/references/add-reference-form";
import { ReferenceCard } from "@/components/references/reference-card";
import type { ServiceReference } from "@/types/service-reference";

type Props = {
  references: ServiceReference[];
  editable?: boolean;
  companySlug: string;
};

export function ReferencesSection({
  references,
  editable = false,
  companySlug,
}: Props) {
  if (references.length === 0 && !editable) return null;

  return (
    <ProfileSection
      id="references"
      icon={ProfileIcons.references}
      title="Clients we work for"
      description="Service relationships. “Confirmed” appears only after the client verifies."
    >
      {references.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {references.map((reference) => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              editable={editable}
              companySlug={companySlug}
            />
          ))}
        </div>
      ) : null}

      {editable ? (
        <div className={references.length > 0 ? "mt-5" : undefined}>
          <AddReferenceForm companySlug={companySlug} />
        </div>
      ) : null}
    </ProfileSection>
  );
}
