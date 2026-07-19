import { Badge } from "@/components/ui/badge";
import type { MyRequestResponse } from "@/types/project-request";

type Props = {
  history: MyRequestResponse[];
};

export function ResponseHistory({ history }: Props) {
  return (
    <section>
      <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
        Your responses
      </h2>
      {history.length === 0 ? (
        <p className="mt-3 text-[14px] text-ink-soft">
          Responses you send with credits appear here with buyer contact.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {history.map((h) => (
            <li
              key={h.responseId}
              className="rounded-xl border border-line bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-semibold text-ink">
                  {h.title}
                </span>
                <Badge tone="neutral">{h.status}</Badge>
              </div>
              <p className="mt-1 text-[12px] text-ink-soft">
                {h.category} · {h.city}
              </p>
              <p className="mt-2 text-[13px] text-ink">
                {h.requesterName}
                {h.requesterCompany ? ` · ${h.requesterCompany}` : ""}
                {" · "}
                <a
                  href={`mailto:${h.requesterEmail}`}
                  className="font-medium underline"
                >
                  {h.requesterEmail}
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
