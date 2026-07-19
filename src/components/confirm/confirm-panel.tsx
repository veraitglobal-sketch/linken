import { ConfirmAuth } from "@/components/confirm/confirm-auth";
import { ConfirmCompanyForm } from "@/components/confirm/confirm-company-form";
import { ConfirmDecision } from "@/components/confirm/confirm-decision";
import type { ClientConfirmationView } from "@/types/client-confirmation";

type ViewerCompany = {
  id: string;
  name: string;
  slug: string;
} | null;

type Props = {
  view: ClientConfirmationView;
  userId: string | null;
  company: ViewerCompany;
  error?: string;
  done?: string;
};

export function ConfirmPanel({ view, userId, company, error, done }: Props) {
  const next = `/confirm/${view.token}`;

  if (done === "confirmed" || view.status === "confirmed") {
    return (
      <StatusCard
        title="Already confirmed"
        body={`${view.confirmerName ?? "A client company"} confirmed this project on Linken.`}
      />
    );
  }

  if (done === "declined" || view.status === "declined") {
    return (
      <StatusCard
        title="Request declined"
        body="This confirmation request was declined."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      {!userId ? (
        <ConfirmAuth next={next} invitedEmail={view.email} />
      ) : !company ? (
        <ConfirmCompanyForm next={next} />
      ) : (
        <ConfirmDecision view={view} companyName={company.name} />
      )}
    </div>
  );
}

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center sm:px-7">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
    </div>
  );
}
