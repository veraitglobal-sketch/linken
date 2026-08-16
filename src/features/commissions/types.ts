export type ReferredClientRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  since: string;
  monthlyCommissionCents: number;
  installedVariants: string[];
};

export type CommissionMonthPoint = {
  /** YYYY-MM */
  key: string;
  label: string;
  cents: number;
  euros: number;
};
