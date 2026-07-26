import Link from "next/link";
import { formatReferencePeriod } from "@/components/references/reference-period";
import { deleteReference } from "@/features/references/actions";
import {
  confirmationLevelLabel,
  isUndisclosedPublic,
} from "@/features/confirmations/meta";
import { publicReferenceClient } from "@/features/confirmations/public-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceReference } from "@/types/service-reference";
import { cn } from "@/lib/cn";

type Props = {
  reference: ServiceReference;
  editable?: boolean;
  companySlug?: string;
};

export function ReferenceCard({
  reference,
  editable = false,
  companySlug,
}: Props) {
  const view = publicReferenceClient(reference, { reveal: editable });
  const confirmed = view.status === "confirmed";
  const period = formatReferencePeriod(view);
  const depth = confirmationLevelLabel(view.confirmationLevel);
  const undisclosed = isUndisclosedPublic(view.disclosure);

  return (
    <article
      className={cn(
        "rounded-[22px] border px-4 py-4 sm:px-5",
        confirmed
          ? "border-[#1a5c51]/25 bg-[linear-gradient(135deg,rgba(31,107,92,0.08),rgba(255,255,255,0.9))]"
          : "border-line bg-[#f7f8fa]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {view.clientSlug ? (
            <Link
              href={`/c/${view.clientSlug}?src=partner`}
              className="font-display text-[1.1rem] font-medium tracking-[-0.03em] text-ink hover:underline"
            >
              {view.clientName}
            </Link>
          ) : (
            <p className="font-display text-[1.1rem] font-medium tracking-[-0.03em] text-ink">
              {view.clientName}
            </p>
          )}
          <p className="mt-1 text-[14px] text-ink-soft">{view.service}</p>
          <p className="mt-1.5 text-[12px] text-muted">
            {period}
            {view.ongoing && confirmed ? " · ongoing" : null}
            {undisclosed && editable ? " · undisclosed publicly" : null}
          </p>
        </div>
        {confirmed ? (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge tone="success" className="rounded-lg uppercase tracking-[0.08em]">
              Confirmed
            </Badge>
            {depth ? (
              <Badge tone="neutral" className="rounded-lg tracking-[0.04em]">
                {depth}
              </Badge>
            ) : null}
          </div>
        ) : (
          <Badge tone="neutral" className="shrink-0 rounded-lg uppercase tracking-[0.06em]">
            Awaiting confirmation
          </Badge>
        )}
      </div>
      {editable ? (
        <form action={deleteReference} className="mt-3">
          <input type="hidden" name="id" value={reference.id} />
          {companySlug ? (
            <input type="hidden" name="company_slug" value={companySlug} />
          ) : null}
          <Button type="submit" variant="ghost" className="h-8 px-2 text-[12px]">
            Remove
          </Button>
        </form>
      ) : null}
    </article>
  );
}
