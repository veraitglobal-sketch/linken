import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
};

export function CompanyIdentity({ company }: Props) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-4">
        <LogoMark initials={company.logoInitials} size="lg" />
        <div>
          {company.verified ? (
            <Badge tone="success">Verified company</Badge>
          ) : (
            <Badge>Profile active</Badge>
          )}
          <p className="mt-2 text-sm text-ink-soft">{company.name}</p>
          <p className="mt-1 text-[12px] text-muted">
            Public company profile · linken.com/{company.slug}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" href={company.website}>
          Website
        </Button>
        <Button variant="secondary">Share</Button>
      </div>
    </header>
  );
}
