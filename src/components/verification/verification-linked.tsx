import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runBacklinkCheck } from "@/features/verification/actions";

type Props = {
  companySlug: string;
  linked: boolean;
};

export function VerificationLinked({ companySlug, linked }: Props) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4 shadow-[0_1px_0_rgba(8,20,18,0.03)] sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
            Optional
          </p>
          <p className="mt-1 text-[14px] font-semibold tracking-[-0.02em] text-ink">
            Website linked
          </p>
          <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted">
            Homepage links to{" "}
            <span className="font-mono text-[11px] text-ink">
              /c/{companySlug}
            </span>
            . This is separate from domain Verified.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {linked ? (
            <Badge tone="success">Linked</Badge>
          ) : (
            <Badge tone="neutral">Not linked</Badge>
          )}
          <form action={runBacklinkCheck}>
            <Button type="submit" variant="secondary" className="h-9">
              Check link
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
