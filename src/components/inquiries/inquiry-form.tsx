"use client";

import { useState } from "react";
import { sendInquiry } from "@/features/inquiries/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  companySlug: string;
  companyName: string;
  defaultOpen?: boolean;
  fullyBooked?: boolean;
};

export function InquiryForm({
  companySlug,
  companyName,
  defaultOpen = false,
  fullyBooked = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (!open) {
    return (
      <Button
        type="button"
        variant="light"
        className="h-11 min-w-[150px] px-5"
        onClick={() => setOpen(true)}
      >
        Request a quote
      </Button>
    );
  }

  return (
    <form
      id="contact"
      action={sendInquiry}
      className="relative w-full max-w-md rounded-2xl border border-white/15 bg-black/35 px-4 py-4 text-left backdrop-blur-md"
    >
      <input type="hidden" name="company_slug" value={companySlug} />
      {/* Honeypot — leave empty */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
        Contact {companyName}
      </p>
      <p className="mt-1 text-[13px] text-white/65">
        Your message goes to the company — not published on Linken.
      </p>
      {fullyBooked ? (
        <p className="mt-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[12px] text-white/70">
          This company is currently fully booked. You can still send an inquiry
          for a future opening.
        </p>
      ) : null}

      <div className="mt-3 grid gap-2.5">
        <Input
          name="sender_name"
          required
          placeholder="Your name"
          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
        />
        <Input
          type="email"
          name="sender_email"
          required
          placeholder="you@company.com"
          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
        />
        <Input
          name="sender_company"
          placeholder="Your company (optional)"
          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
        />
        <Input
          name="service_interest"
          placeholder="What are you interested in? (optional)"
          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
        />
        <textarea
          name="message"
          required
          minLength={10}
          rows={3}
          placeholder="Briefly describe what you need"
          className="min-h-[5rem] w-full resize-none rounded-xl border border-white/20 bg-white/10 px-3.5 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/40 focus:border-[#5ec4a8] focus:ring-2 focus:ring-[rgba(94,196,168,0.2)]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" variant="light" className="h-10 px-4">
          Send inquiry
        </Button>
        <Button
          type="button"
          variant="onDark"
          className="h-10 px-4"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
