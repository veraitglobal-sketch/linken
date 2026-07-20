import type { ReactNode } from "react";
import type { SettingsCompany } from "@/features/company/settings-company";
import { ServicesTagInput } from "@/components/company/services-tag-input";
import { Input } from "@/components/ui/input";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint}
    </label>
  );
}

const textareaClass =
  "min-h-[5.5rem] w-full resize-y rounded-xl border border-line bg-[#f7f8fa] px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-muted focus:border-[#1a5c51] focus:bg-white focus:ring-2 focus:ring-[rgba(31,107,92,0.15)]";

export function CompanySettingsFields({ company }: { company: SettingsCompany }) {
  return (
    <>
      <Field
        label="Company name"
        hint={
          <p
            className="mt-1.5 text-[11px] text-[#94a3b8]"
            title="Your public URL is permanent. Changing it would break QR codes and embeds on partner sites."
          >
            Public link: {company.publicHost}/c/{company.slug} — permanent
          </p>
        }
      >
        <Input name="name" required defaultValue={company.name} maxLength={120} />
      </Field>

      <Field label="Tagline">
        <Input
          name="tagline"
          defaultValue={company.tagline}
          maxLength={160}
          placeholder="One short line under your name"
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          rows={4}
          defaultValue={company.description}
          maxLength={4000}
          className={textareaClass}
          placeholder="What you do and how partners help deliver."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <Input name="category" defaultValue={company.category} maxLength={80} />
        </Field>
        <Field label="City">
          <Input name="city" defaultValue={company.city} maxLength={80} />
        </Field>
        <Field label="Country">
          <Input name="country" defaultValue={company.country} maxLength={80} />
        </Field>
        <Field
          label="Website"
          hint={
            company.verified ? (
              <p className="mt-1.5 text-[11px] text-amber-800/80">
                Changing your website will require re-verification if the domain
                changes.
              </p>
            ) : null
          }
        >
          <Input
            name="website"
            defaultValue={company.website}
            placeholder="https://example.com"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="LinkedIn">
          <Input
            name="linkedin_url"
            type="url"
            defaultValue={company.linkedinUrl}
            placeholder="https://linkedin.com/company/…"
          />
        </Field>
        <Field label="Facebook">
          <Input
            name="facebook_url"
            type="url"
            defaultValue={company.facebookUrl}
            placeholder="https://facebook.com/…"
          />
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-[13px] font-medium text-ink">
          Services
        </span>
        <ServicesTagInput defaultServices={company.services} />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-[#e8eaee] bg-[#fafbfc] px-4 py-3">
        <input
          type="checkbox"
          name="accepting_clients"
          value="true"
          defaultChecked={company.acceptingClients}
          className="mt-1 h-4 w-4 rounded border-line"
        />
        <span>
          <span className="block text-[13px] font-semibold text-ink">
            Accepting new clients
          </span>
          <span className="mt-0.5 block text-[12px] text-[#64748b]">
            Shown on your public profile and one-pager.
          </span>
        </span>
      </label>
    </>
  );
}
