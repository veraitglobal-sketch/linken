import type { CaseStudyMetric } from "@/types/case-study";

export type CaseStudyAgentJson = {
  title?: string;
  summary?: string;
  challenge?: string;
  outcome?: string;
  process?: string;
  location?: string;
  year?: string;
  duration?: string;
  sector?: string;
  scope?: string;
  client_label?: string;
  highlight_stat?: string;
  client_quote?: string;
  metrics?: CaseStudyMetric[];
  services?: string[];
};

export function mapCaseStudyAgentInput(data: CaseStudyAgentJson) {
  return {
    title: data.title,
    summary: data.summary,
    challenge: data.challenge,
    outcome: data.outcome,
    process: data.process,
    location: data.location,
    year: data.year,
    duration: data.duration,
    sector: data.sector,
    scope: data.scope,
    clientLabel: data.client_label,
    highlightStat: data.highlight_stat,
    clientQuote: data.client_quote,
    metrics: data.metrics,
    services: data.services,
  };
}
