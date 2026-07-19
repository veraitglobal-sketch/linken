import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { CodePanel } from "@/components/developers/code-panel";
import type { CodeTab } from "@/components/developers/code-types";
import type { FieldRow } from "@/components/developers/docs-content";
import { FieldTable } from "@/components/developers/field-table";

type Props = {
  id: string;
  index?: string;
  method?: "GET";
  path: string;
  title: string;
  description: string;
  notes?: ReactNode;
  fields: FieldRow[];
  requestTabs: CodeTab[];
  responseTabs: CodeTab[];
};

export function EndpointSection({
  id,
  index,
  method = "GET",
  path,
  title,
  description,
  notes,
  fields,
  requestTabs,
  responseTabs,
}: Props) {
  return (
    <section id={id} className="scroll-mt-28">
      <article className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="border-b border-line bg-paper/60 px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone="success">{method}</Badge>
            <code className="break-all font-mono text-[13px] font-medium text-ink sm:text-[14px]">
              {path}
            </code>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            {index ? (
              <span className="font-display text-[12px] tracking-[0.08em] text-muted">
                {index}
              </span>
            ) : null}
            <h3 className="font-display text-[clamp(1.4rem,2vw,1.75rem)] font-medium tracking-[-0.03em] text-ink">
              {title}
            </h3>
          </div>
          <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
            {description}
          </p>
          {notes ? (
            <div className="mt-3 max-w-[42rem] text-[13px] leading-relaxed text-ink-soft">
              {notes}
            </div>
          ) : null}
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="border-b border-line px-5 py-6 sm:px-7 lg:border-r lg:border-b-0">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Response fields
            </p>
            <FieldTable fields={fields} />
          </div>
          <div className="space-y-3 bg-paper/50 px-4 py-5 sm:px-5 lg:py-6">
            <CodePanel tabs={requestTabs} caption="Request" />
            <CodePanel tabs={responseTabs} caption="Response" />
          </div>
        </div>
      </article>
    </section>
  );
}
