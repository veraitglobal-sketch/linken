import { OauthConsentForm } from "@/components/oauth/oauth-consent-form";
import type { AuthorizeQuery, ConsentCompany } from "@/features/oauth/types";

type Props = {
  clientName: string;
  companies: ConsentCompany[];
  query: AuthorizeQuery;
  issue?: string;
};

function issueCopy(issue: string | undefined) {
  if (issue === "pro") return "Managing your company from Claude is part of Pro.";
  if (issue === "role") return "Only an owner or admin can connect this company.";
  if (issue === "server") return "Could not complete the connection. Try again.";
  return null;
}

export function OauthConsentPanel({ clientName, companies, query, issue }: Props) {
  return (
    <div className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[420px]">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Connector
        </p>
        <OauthConsentForm
          clientName={clientName}
          companies={companies}
          query={query}
          notice={issueCopy(issue)}
        />
      </div>
    </div>
  );
}
