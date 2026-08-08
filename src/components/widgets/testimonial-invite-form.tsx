"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createTestimonialInvite } from "@/features/testimonials/actions";
import { Button } from "@/components/ui/button";

/** Cold-start invite — email + optional company website for unify. */
export function TestimonialInviteForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okUrl, setOkUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [linked, setLinked] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOkUrl(null);
    setEmailSent(false);
    setLinked(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await createTestimonialInvite({
        authorEmail: String(fd.get("email") ?? ""),
        authorCompanyName: String(fd.get("company_name") ?? ""),
        website: String(fd.get("website") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOkUrl(result.url);
      setEmailSent(result.emailSent);
      if (result.linkedCompany) {
        setLinked(result.linkedCompany.name);
      }
      form.reset();
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-surface px-5 py-5">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
        Invite
      </p>
      <p className="mt-1 max-w-xl text-[13px] text-muted">
        Ask a client or partner to describe the collaboration in their own words.
        Stronger evidence comes from invites after a confirmed partnership or project.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[11px] font-semibold text-ink-soft">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="name@firm.com"
            className="mt-1 h-11 w-full rounded-xl border border-line bg-paper px-3 text-[14px] text-ink outline-none focus:border-blue/40"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-ink-soft">
            Their company (optional)
          </span>
          <input
            name="company_name"
            type="text"
            placeholder="Company name"
            className="mt-1 h-11 w-full rounded-xl border border-line bg-paper px-3 text-[14px] text-ink outline-none focus:border-blue/40"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-ink-soft">
            Website (optional)
          </span>
          <input
            name="website"
            type="text"
            placeholder="firm.com"
            className="mt-1 h-11 w-full rounded-xl border border-line bg-paper px-3 text-[14px] text-ink outline-none focus:border-blue/40"
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending} className="h-11 px-5">
            {pending ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </form>
      {error ? (
        <p className="mt-3 text-[13px] text-ember">{error}</p>
      ) : null}
      {okUrl ? (
        <p className="mt-3 text-[13px] text-ink-soft">
          {emailSent
            ? "Invite email sent."
            : "Invite created, but the email could not be sent — share the link below."}
          {linked ? ` Linked to ${linked} on Hansala.` : null}{" "}
          <a
            href={okUrl}
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Open link
          </a>
        </p>
      ) : null}
    </section>
  );
}
