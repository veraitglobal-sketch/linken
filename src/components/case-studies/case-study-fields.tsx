import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  defaults?: {
    title?: string;
    summary?: string;
    challenge?: string;
    outcome?: string;
    process?: string;
    location?: string;
    year?: string;
    services?: string;
  };
  showEmail?: boolean;
  showPartner?: boolean;
};

export function CaseStudyFields({
  defaults = {},
  showEmail = false,
  showPartner = false,
}: Props) {
  const yearDefault = defaults.year ?? new Date().getFullYear().toString();

  return (
    <>
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          Project title
        </span>
        <Input
          name="title"
          required
          defaultValue={defaults.title}
          placeholder="Vienna HQ fit-out"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          Summary — the hook on your public page
        </span>
        <Textarea
          name="summary"
          required
          defaultValue={defaults.summary}
          placeholder="One compelling paragraph that makes someone want to read more."
          className="min-h-[96px]"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">Year</span>
          <Input name="year" defaultValue={yearDefault} placeholder="2025" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Location
          </span>
          <Input
            name="location"
            defaultValue={defaults.location}
            placeholder="Vienna, AT"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          Services (comma-separated)
        </span>
        <Input
          name="services"
          defaultValue={defaults.services}
          placeholder="Architecture, MEP, General contracting"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          The challenge
        </span>
        <Textarea
          name="challenge"
          defaultValue={defaults.challenge}
          placeholder="What problem did the client face? Constraints, timeline, complexity."
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          The outcome
        </span>
        <Textarea
          name="outcome"
          defaultValue={defaults.outcome}
          placeholder="What changed? Results, metrics, client impact."
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          How you delivered
        </span>
        <Textarea
          name="process"
          defaultValue={defaults.process}
          placeholder="Your approach, team structure, phases, tools — the story behind the work."
          className="min-h-[140px]"
        />
      </label>

      {showEmail ? (
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Client email — send confirmation now
          </span>
          <Input type="email" name="email" required placeholder="client@company.com" />
        </label>
      ) : null}

      {showPartner ? (
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Partner company slug (optional)
          </span>
          <Input name="partner_slug" placeholder="partner-firm" />
        </label>
      ) : null}
    </>
  );
}
