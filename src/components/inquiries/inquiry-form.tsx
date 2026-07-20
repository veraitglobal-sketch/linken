"use client";

import { useState } from "react";
import { sendInquiry } from "@/features/inquiries/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type ForMember = {
  displayName: string;
  displayTitle?: string;
};

type Props = {
  companySlug: string;
  companyName: string;
  defaultOpen?: boolean;
  fullyBooked?: boolean;
  /** Light panel styles (network map) vs dark hero. */
  appearance?: "onDark" | "panel";
  /** Safe redirect after send (must start with /). */
  back?: string;
  /** Optional routing hint — written into service_interest / message prefix. */
  forMember?: ForMember;
  onCancel?: () => void;
};

function forLabel(m: ForMember) {
  return m.displayTitle
    ? `For: ${m.displayName}, ${m.displayTitle}`
    : `For: ${m.displayName}`;
}

export function InquiryForm({
  companySlug,
  companyName,
  defaultOpen = false,
  fullyBooked = false,
  appearance = "onDark",
  back,
  forMember,
  onCancel,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panel = appearance === "panel";
  const forHint = forMember ? forLabel(forMember) : "";

  if (!open) {
    return (
      <Button
        type="button"
        variant={panel ? "primary" : "light"}
        className="h-11 min-w-[150px] px-5"
        onClick={() => setOpen(true)}
      >
        {panel ? `Contact ${companyName}` : "Request a quote"}
      </Button>
    );
  }

  return (
    <form
      id="contact"
      action={sendInquiry}
      className={cn(
        "relative w-full text-left",
        panel
          ? "rounded-xl border border-[#e8eaee] bg-[#f7f8fa] px-3 py-3"
          : "max-w-md rounded-2xl border border-white/15 bg-black/35 px-4 py-4 backdrop-blur-md",
      )}
    >
      <input type="hidden" name="company_slug" value={companySlug} />
      {back ? <input type="hidden" name="back" value={back} /> : null}
      {forHint ? (
        <input type="hidden" name="for_member" value={forHint} />
      ) : null}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p
        className={cn(
          "text-[11px] font-semibold tracking-[0.14em] uppercase",
          panel ? "text-[#94a3b8]" : "text-white/50",
        )}
      >
        Contact {companyName}
      </p>
      {forHint ? (
        <p
          className={cn(
            "mt-1 text-[12px] font-medium",
            panel ? "text-ink" : "text-white/85",
          )}
        >
          {forHint}
        </p>
      ) : null}
      <p
        className={cn(
          "mt-1 text-[12px]",
          panel ? "text-[#64748b]" : "text-white/65",
        )}
      >
        Message goes to the company inbox — no personal emails shown.
      </p>
      {fullyBooked ? (
        <p
          className={cn(
            "mt-2 rounded-xl border px-3 py-2 text-[12px]",
            panel
              ? "border-[#e8eaee] bg-white text-[#64748b]"
              : "border-white/15 bg-white/5 text-white/70",
          )}
        >
          This company is currently fully booked. You can still send an inquiry
          for a future opening.
        </p>
      ) : null}

      <div className="mt-3 grid gap-2.5">
        <Input
          name="sender_name"
          required
          placeholder="Your name"
          className={
            panel
              ? undefined
              : "border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
          }
        />
        <Input
          type="email"
          name="sender_email"
          required
          placeholder="you@company.com"
          className={
            panel
              ? undefined
              : "border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
          }
        />
        <Input
          name="sender_company"
          placeholder="Your company (optional)"
          className={
            panel
              ? undefined
              : "border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
          }
        />
        <Input
          name="service_interest"
          defaultValue={forHint || undefined}
          placeholder="What are you interested in? (optional)"
          className={
            panel
              ? undefined
              : "border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
          }
        />
        <textarea
          name="message"
          required
          minLength={10}
          rows={3}
          placeholder="Briefly describe what you need"
          className={cn(
            "min-h-[5rem] w-full resize-none rounded-xl border px-3.5 py-3 text-sm leading-relaxed outline-none",
            panel
              ? "border-[#e6eaf0] bg-white text-ink placeholder:text-[#94a3b8] focus:border-ink"
              : "border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-[#7eb8a4] focus:ring-2 focus:ring-[rgba(126, 184, 164,0.2)]",
          )}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="submit"
          variant={panel ? "primary" : "light"}
          className="h-10 px-4"
        >
          Send inquiry
        </Button>
        <Button
          type="button"
          variant={panel ? "ghost" : "onDark"}
          className="h-10 px-4"
          onClick={() => {
            setOpen(false);
            onCancel?.();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
