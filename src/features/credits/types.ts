export type CreditCheckResult =
  | { ok: true; live: number; missing: number }
  | { ok: false; error: string };

export type CreditTargetRow = {
  partnershipId: string;
  credited: {
    id: string;
    slug: string;
    website: string;
  };
};

export type PartnerCreditFlags = {
  publishedByMe: boolean;
  publishedByThem: boolean;
};
