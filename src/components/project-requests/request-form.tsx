import { StatusMessage } from "@/components/a11y/status-message";
import { createProjectRequest } from "@/features/project-requests/buyer-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  error?: string;
  sent?: boolean;
};

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ProjectRequestForm({ error, sent }: Props) {
  if (sent) {
    return (
      <StatusMessage className="rounded-xl border border-line bg-paper px-5 py-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
          Request sent
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          We will let you know when firms respond
        </h2>
        <p className="mt-2 text-[14px] text-muted">
          Check your email for a private link to track replies. Verified firms in
          your category and city can respond — up to five.
        </p>
      </StatusMessage>
    );
  }

  return (
    <form action={createProjectRequest} className="relative grid gap-3">
      <input type="hidden" name="back" value="/requests/new" />
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Company website
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {error ? <StatusMessage tone="alert">{error}</StatusMessage> : null}

      <Field id="pr-title" label="What do you need?">
        <Input
          id="pr-title"
          name="title"
          required
          minLength={5}
          placeholder="e.g. Interior fit-out for a clinic"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="pr-category" label="Category">
          <Input
            id="pr-category"
            name="category"
            required
            placeholder="e.g. Architecture"
          />
        </Field>
        <Field id="pr-city" label="City">
          <Input id="pr-city" name="city" required placeholder="City" />
        </Field>
      </div>
      <Field id="pr-country" label="Country (optional)">
        <Input id="pr-country" name="country" placeholder="Country" />
      </Field>
      <Field id="pr-description" label="Project description">
        <textarea
          id="pr-description"
          name="description"
          required
          minLength={20}
          rows={5}
          placeholder="Scope, constraints, and timing"
          className="min-h-[8rem] w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-[rgba(126,184,164,0.22)]"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="pr-budget" label="Budget hint (optional)">
          <Input id="pr-budget" name="budget_hint" placeholder="Budget range" />
        </Field>
        <Field id="pr-timeline" label="Timeline (optional)">
          <Input id="pr-timeline" name="timeline" placeholder="When you need it" />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="pr-name" label="Your name">
          <Input id="pr-name" name="requester_name" required autoComplete="name" />
        </Field>
        <Field id="pr-email" label="Your email">
          <Input
            id="pr-email"
            type="email"
            name="requester_email"
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
        </Field>
      </div>
      <Field id="pr-company" label="Your company (optional)">
        <Input
          id="pr-company"
          name="requester_company"
          autoComplete="organization"
        />
      </Field>

      <p className="text-[12px] text-muted">
        Your email stays private until a verified firm spends a credit to respond.
        Profile inquiries on company pages remain free for firms.
      </p>

      <Button type="submit" variant="primary" className="h-11 w-full sm:w-auto">
        Publish request
      </Button>
    </form>
  );
}
