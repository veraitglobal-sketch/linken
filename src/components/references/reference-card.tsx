import Link from "next/link";
import { formatReferencePeriod } from "@/components/references/reference-period";
import { deleteReference } from "@/features/references/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceReference } from "@/types/service-reference";
import { cn } from "@/lib/cn";

type Props = {
  reference: ServiceReference;
  editable?: boolean;
};

export function ReferenceCard({ reference, editable = false }: Props) {
  const confirmed = reference.status === "confirmed";
  const period = formatReferencePeriod(reference);

  return (
    <article
      className={cn(
        "rounded-[22px] border px-4 py-4 sm:px-5",
        confirmed
          ? "border-[#1f6b5c]/25 bg-[linear-gradient(135deg,rgba(31,107,92,0.08),rgba(255,255,255,0.9))]"
          : "border-line bg-[#f7f8fa]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {reference.clientSlug ? (
            <Link
              href={`/c/${reference.clientSlug}?src=partner`}
              className="font-display text-[1.1rem] font-medium tracking-[-0.03em] text-ink hover:underline"
            >
              {reference.clientName}
            </Link>
          ) : (
            <p className="font-display text-[1.1rem] font-medium tracking-[-0.03em] text-ink">
              {reference.clientName}
            </p>
          )}
          <p className="mt-1 text-[14px] text-ink-soft">{reference.service}</p>
          <p className="mt-1.5 text-[12px] text-muted">
            {period}
            {reference.ongoing && confirmed ? " · ongoing" : null}
          </p>
        </div>
        {confirmed ? (
          <Badge tone="success" className="shrink-0 rounded-lg uppercase tracking-[0.08em]">
            Confirmed
          </Badge>
        ) : (
          <Badge tone="neutral" className="shrink-0 rounded-lg uppercase tracking-[0.06em]">
            Awaiting confirmation
          </Badge>
        )}
      </div>
      {editable ? (
        <form action={deleteReference} className="mt-3">
          <input type="hidden" name="id" value={reference.id} />
          <Button type="submit" variant="ghost" className="h-8 px-2 text-[12px]">
            Remove
          </Button>
        </form>
      ) : null}
    </article>
  );
}
