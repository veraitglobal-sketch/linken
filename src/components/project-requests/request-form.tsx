import { createProjectRequest } from "@/features/project-requests/buyer-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  error?: string;
  sent?: boolean;
};

export function ProjectRequestForm({ error, sent }: Props) {
  if (sent) {
    return (
      <div className="rounded-xl border border-line bg-paper px-5 py-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
          Request sent
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          We will let you know when firms respond
        </h2>
        <p className="mt-2 text-[14px] text-muted">
          Check your email for a private link to track replies. Verified firms
          in your category and city can respond — up to five.
        </p>
      </div>
    );
  }

  return (
    <form action={createProjectRequest} className="relative grid gap-3">
      <input type="hidden" name="back" value="/requests/new" />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error ? (
        <p className="rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <Input name="title" required minLength={5} placeholder="What do you need?" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="category" required placeholder="Category (e.g. Architecture)" />
        <Input name="city" required placeholder="City" />
      </div>
      <Input name="country" placeholder="Country (optional)" />
      <textarea
        name="description"
        required
        minLength={20}
        rows={5}
        placeholder="Describe the project, scope, and constraints"
        className="min-h-[8rem] w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-muted focus:border-ink"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="budget_hint" placeholder="Budget hint (optional)" />
        <Input name="timeline" placeholder="Timeline (optional)" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="requester_name" required placeholder="Your name" />
        <Input
          type="email"
          name="requester_email"
          required
          placeholder="you@company.com"
        />
      </div>
      <Input name="requester_company" placeholder="Your company (optional)" />

      <p className="text-[12px] text-muted">
        Your email stays private until a verified firm spends a credit to
        respond. Profile inquiries on company pages remain free for firms.
      </p>

      <Button type="submit" variant="primary" className="h-11 w-full sm:w-auto">
        Publish request
      </Button>
    </form>
  );
}
