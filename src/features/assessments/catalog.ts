export const ASSESSMENT_STRENGTHS = [
  "reliability",
  "communication",
  "quality",
  "deadlines",
  "value",
  "flexibility",
  "expertise",
  "proactivity",
] as const;

export type AssessmentStrength = (typeof ASSESSMENT_STRENGTHS)[number];

export const STRENGTH_LABELS: Record<AssessmentStrength, string> = {
  reliability: "Reliability",
  communication: "Communication",
  quality: "Quality",
  deadlines: "Deadlines",
  value: "Value",
  flexibility: "Flexibility",
  expertise: "Expertise",
  proactivity: "Proactivity",
};

export function isAssessmentStrength(value: string): value is AssessmentStrength {
  return (ASSESSMENT_STRENGTHS as readonly string[]).includes(value);
}

export type AssessmentSourceType = "reference" | "confirmation";
