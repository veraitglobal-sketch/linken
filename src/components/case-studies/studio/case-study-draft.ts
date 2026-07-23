export type CaseStudyDraft = {
  title: string;
  summary: string;
  challenge: string;
  outcome: string;
  process: string;
  location: string;
  year: string;
  duration: string;
  sector: string;
  scope: string;
  clientLabel: string;
  highlightStat: string;
  clientQuote: string;
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
  metric3Label: string;
  metric3Value: string;
  services: string;
  coverImageUrl: string | null;
  galleryUrls: string[];
};

export type CaseStudyStudioTab = "visual" | "story" | "proof" | "client";

export function draftFromCaseStudy(cs: {
  title: string;
  summary: string;
  challenge: string;
  outcome: string;
  process: string;
  location: string;
  year: string;
  duration: string;
  sector: string;
  scope: string;
  clientLabel: string;
  highlightStat: string;
  clientQuote: string;
  metrics: { label: string; value: string }[];
  services: string[];
  coverImageUrl: string | null;
  galleryUrls: string[];
}): CaseStudyDraft {
  const [m1, m2, m3] = cs.metrics;
  return {
    title: cs.title,
    summary: cs.summary,
    challenge: cs.challenge,
    outcome: cs.outcome,
    process: cs.process,
    location: cs.location,
    year: cs.year,
    duration: cs.duration,
    sector: cs.sector,
    scope: cs.scope,
    clientLabel: cs.clientLabel,
    highlightStat: cs.highlightStat,
    clientQuote: cs.clientQuote,
    metric1Label: m1?.label ?? "",
    metric1Value: m1?.value ?? "",
    metric2Label: m2?.label ?? "",
    metric2Value: m2?.value ?? "",
    metric3Label: m3?.label ?? "",
    metric3Value: m3?.value ?? "",
    services: cs.services.join(", "),
    coverImageUrl: cs.coverImageUrl,
    galleryUrls: cs.galleryUrls,
  };
}

export function servicesList(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function draftMetrics(draft: CaseStudyDraft) {
  return [
    { label: draft.metric1Label, value: draft.metric1Value },
    { label: draft.metric2Label, value: draft.metric2Value },
    { label: draft.metric3Label, value: draft.metric3Value },
  ].filter((m) => m.label.trim() && m.value.trim());
}

export function draftContextFields(draft: CaseStudyDraft) {
  return {
    sector: draft.sector,
    scope: draft.scope,
    client_label: draft.clientLabel,
    duration: draft.duration,
    highlight_stat: draft.highlightStat,
    client_quote: draft.clientQuote,
    metric_1_label: draft.metric1Label,
    metric_1_value: draft.metric1Value,
    metric_2_label: draft.metric2Label,
    metric_2_value: draft.metric2Value,
    metric_3_label: draft.metric3Label,
    metric_3_value: draft.metric3Value,
  };
}
