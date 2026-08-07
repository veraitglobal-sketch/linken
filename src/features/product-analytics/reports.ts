/**
 * Funnel / dashboard report specifications.
 * SQL lives in docs/sql/product-analytics-reports.sql — run in Supabase SQL editor
 * or warehouse. North-star: 7-day first confirmed reference rate.
 */

export type AnalyticsReportId =
  | "signup_conversion"
  | "time_to_first_project"
  | "invitation_send_rate"
  | "invitation_open_rate"
  | "invitation_confirmation_rate"
  | "time_to_first_confirmed_reference"
  | "seven_day_activation_rate"
  | "invited_company_conversion"
  | "free_to_pro_conversion"
  | "retention_activated_companies";

export type AnalyticsReportSpec = {
  id: AnalyticsReportId;
  title: string;
  description: string;
  northStar?: boolean;
  grain: "daily" | "weekly" | "cohort";
  numerator: string;
  denominator: string;
  sqlRef: string;
};

export const ANALYTICS_REPORTS: AnalyticsReportSpec[] = [
  {
    id: "signup_conversion",
    title: "Signup conversion",
    description: "landing_page_viewed → signup_started → signup_completed → company_created",
    grain: "daily",
    numerator: "signup_completed (or company_created)",
    denominator: "landing_page_viewed",
    sqlRef: "report_signup_conversion",
  },
  {
    id: "time_to_first_project",
    title: "Time to first project",
    description: "Hours from company_created to first_project_created",
    grain: "cohort",
    numerator: "median hours to first_project_created",
    denominator: "companies with company_created",
    sqlRef: "report_time_to_first_project",
  },
  {
    id: "invitation_send_rate",
    title: "Invitation send rate",
    description: "Share of companies that send a first invitation",
    grain: "weekly",
    numerator: "companies with first_invitation_sent",
    denominator: "companies with company_created",
    sqlRef: "report_invitation_send_rate",
  },
  {
    id: "invitation_open_rate",
    title: "Invitation open rate",
    description: "first_invitation_opened / first_invitation_sent",
    grain: "weekly",
    numerator: "first_invitation_opened",
    denominator: "first_invitation_sent",
    sqlRef: "report_invitation_open_rate",
  },
  {
    id: "invitation_confirmation_rate",
    title: "Invitation confirmation rate",
    description: "first_reference_confirmed / first_invitation_sent",
    grain: "weekly",
    numerator: "first_reference_confirmed",
    denominator: "first_invitation_sent",
    sqlRef: "report_invitation_confirmation_rate",
  },
  {
    id: "time_to_first_confirmed_reference",
    title: "Time to first confirmed reference",
    description: "Hours from company_created to first_reference_confirmed",
    grain: "cohort",
    numerator: "median hours to first_reference_confirmed",
    denominator: "companies with first_reference_confirmed",
    sqlRef: "report_time_to_first_confirmed_reference",
  },
  {
    id: "seven_day_activation_rate",
    title: "Seven-day activation rate",
    description:
      "Percentage of new companies that receive their first verified (confirmed) reference within seven days",
    northStar: true,
    grain: "weekly",
    numerator:
      "companies with first_reference_confirmed within 7 days of companies.created_at",
    denominator: "companies created in cohort window (claimed)",
    sqlRef: "report_seven_day_activation_rate",
  },
  {
    id: "invited_company_conversion",
    title: "Invited-company conversion",
    description:
      "invited_company_confirmed → created_profile → sent_first_invitation",
    grain: "weekly",
    numerator: "invited_company_sent_first_invitation",
    denominator: "invited_company_confirmed",
    sqlRef: "report_invited_company_conversion",
  },
  {
    id: "free_to_pro_conversion",
    title: "Free-to-Pro conversion",
    description: "pricing_viewed → checkout_started → subscription_started",
    grain: "weekly",
    numerator: "subscription_started",
    denominator: "pricing_viewed (or free companies)",
    sqlRef: "report_free_to_pro_conversion",
  },
  {
    id: "retention_activated_companies",
    title: "Retention of activated companies",
    description:
      "Activated companies (first_reference_confirmed) with engagement in weeks 2–5",
    grain: "cohort",
    numerator: "activated companies with any engagement event in days 8–35",
    denominator: "companies with first_reference_confirmed",
    sqlRef: "report_retention_activated_companies",
  },
];

export function getAnalyticsReport(
  id: AnalyticsReportId,
): AnalyticsReportSpec | null {
  return ANALYTICS_REPORTS.find((r) => r.id === id) ?? null;
}
