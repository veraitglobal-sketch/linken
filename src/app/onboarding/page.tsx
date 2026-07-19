import type { Metadata } from "next";
import { createCompany } from "@/features/company/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata: Metadata = {
  title: "Create company",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const fields = [
  { name: "name", label: "Company name", placeholder: "Acme Architecture" },
  { name: "category", label: "Category", placeholder: "Architecture" },
  { name: "city", label: "City", placeholder: "Berlin" },
  { name: "website", label: "Website", placeholder: "https://" },
];

export default async function OnboardingPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <SectionTitle
        eyebrow="Onboarding"
        title="Register your company"
        description="The account owner creates the firm profile. Without a profile, the company cannot appear in search or confirm partners."
      />
      {error ? (
        <p className="mt-4 border border-[rgba(196,92,38,0.35)] bg-[rgba(196,92,38,0.08)] px-3 py-2 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <form
        action={createCompany}
        className="mt-8 flex flex-col gap-4 border border-line bg-panel p-5 shadow-[var(--shadow)]"
      >
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              {field.label}
            </span>
            <Input name={field.name} placeholder={field.placeholder} required />
          </label>
        ))}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            Short description
          </span>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="What your company does and how partners help clients."
            className="w-full rounded-[4px] border border-line bg-panel px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(12,51,47,0.12)]"
          />
        </label>
        <Button type="submit" className="mt-2">
          Create company profile
        </Button>
      </form>
    </div>
  );
}
