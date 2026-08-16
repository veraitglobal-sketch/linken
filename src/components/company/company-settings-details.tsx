import Link from "next/link";
import type { SettingsCompany } from "@/features/company/settings-company";
import { ORGANIZATION_KIND_META } from "@/features/company/organization-kind";
import { SettingsField } from "@/components/company/settings-field";
import { Input } from "@/components/ui/input";

export function CompanySettingsDetails({
  company,
}: {
  company: SettingsCompany;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
        Details & contact
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Organization type">
          <select
            name="organization_kind"
            defaultValue={company.organizationKind || "company"}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
          >
            {ORGANIZATION_KIND_META.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField label="Sector">
          <Input name="category" defaultValue={company.category} maxLength={80} />
        </SettingsField>
        <SettingsField label="City">
          <Input name="city" defaultValue={company.city} maxLength={80} />
        </SettingsField>
        <SettingsField label="Country">
          <Input name="country" defaultValue={company.country} maxLength={80} />
        </SettingsField>
        <SettingsField
          label="Website"
          hint={
            <>
              {company.verified ? (
                <p className="mt-1.5 text-[11px] text-ember">
                  Changing the domain clears verification — you&apos;ll need to
                  prove ownership again.
                </p>
              ) : null}
              <p className="mt-1.5 text-[11px] text-muted">
                Shown on your public profile.{" "}
                <Link
                  href="/dashboard/widgets"
                  className="font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Add a Hansala embed
                </Link>{" "}
                on this site so visitors can verify confirmed work.
              </p>
            </>
          }
        >
          <Input
            name="website"
            defaultValue={company.website}
            placeholder="https://example.org"
          />
        </SettingsField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="LinkedIn">
          <Input
            name="linkedin_url"
            type="url"
            defaultValue={company.linkedinUrl}
            placeholder="https://linkedin.com/company/…"
          />
        </SettingsField>
        <SettingsField label="Facebook">
          <Input
            name="facebook_url"
            type="url"
            defaultValue={company.facebookUrl}
            placeholder="https://facebook.com/…"
          />
        </SettingsField>
      </div>
    </div>
  );
}
