"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCompany } from "@/features/company/actions";
import { toSlug } from "@/lib/slug";

type Props = {
  error?: string;
};

export function OnboardingForm({ error }: Props) {
  const [name, setName] = useState("");
  const slug = toSlug(name) || "your-company";

  return (
    <div className="rounded-[24px] border border-line bg-white px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-[11px] font-medium tracking-[0.14em] text-[#c4783a] uppercase">
        Profile details
      </p>
      <h1 className="mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink sm:text-[1.35rem]">
        Register your company
      </h1>
      <p className="mt-1 text-[12px] text-ink-soft">
        Complete the fields to publish your company page.
      </p>

      {error ? (
        <p className="mt-2 rounded-lg border border-[#c4783a]/35 bg-[#c4783a]/8 px-3 py-1.5 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <form action={createCompany} className="mt-3 flex flex-col gap-2">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-ink">
            Company name
          </span>
          <Input
            name="name"
            placeholder="Acme Architecture"
            required
            className="h-9"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-muted">
            linken.com/<span className="text-ink">{slug}</span>
          </p>
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-ink">
              Category
            </span>
            <Input
              name="category"
              placeholder="Architecture"
              required
              className="h-9"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-ink">
              City
            </span>
            <Input name="city" placeholder="Berlin" required className="h-9" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-ink">
            Website
          </span>
          <Input name="website" placeholder="https://" required className="h-9" />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-ink">
            Short description
          </span>
          <textarea
            name="description"
            required
            rows={2}
            placeholder="What your company does."
            className="h-16 w-full resize-none rounded-xl border border-line bg-[#f7f8fa] px-3 py-2 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-muted focus:border-[#1f6b5c] focus:bg-white focus:ring-2 focus:ring-[rgba(31,107,92,0.12)]"
          />
        </label>

        <Button type="submit" className="mt-0.5 h-10 w-full">
          Create company profile
        </Button>
      </form>
    </div>
  );
}
