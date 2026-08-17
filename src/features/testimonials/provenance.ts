import {
  emailAllowedOnWebsite,
  emailDomain,
  isPublicEmailProvider,
} from "@/features/verification/domain";
import type { TestimonialSource } from "@/features/testimonials/types";

export type TestimonialProvenance = {
  authorDomain: string | null;
  authorDomainVerified: boolean;
  authorIsFreeProvider: boolean;
  authorCompanyClaimed: boolean;
};

export function resolveAuthorProvenance(input: {
  email: string | null;
  authorCompanyWebsite: string | null;
  authorCompanyVerified: boolean;
  authorCompanyClaimed: boolean;
}): TestimonialProvenance {
  const domain = input.email ? emailDomain(input.email) : null;
  const authorIsFreeProvider = domain ? isPublicEmailProvider(domain) : true;
  const authorDomainVerified = Boolean(
    domain &&
      !authorIsFreeProvider &&
      input.authorCompanyVerified &&
      input.authorCompanyWebsite &&
      input.email &&
      emailAllowedOnWebsite(input.authorCompanyWebsite, input.email),
  );

  return {
    authorDomain: domain,
    authorDomainVerified,
    authorIsFreeProvider,
    authorCompanyClaimed: input.authorCompanyClaimed,
  };
}

/** Factual provenance line — no badges, no judgemental wording. */
export function formatTestimonialProvenance(input: {
  source: TestimonialSource;
  authorDomain: string | null;
  authorDomainVerified: boolean;
  authorIsFreeProvider: boolean;
}): string {
  /* "Confirmed by the client" was carried at the head of every one of these and
     is exactly what the check mark beside the line already says, so it is gone —
     roughly forty per cent of the string, and the difference between fitting on
     one line and taking two on a 340px card.
     What could not go is the part that separates a strong source from a weak
     one. A domain-verified record and one confirmed from a gmail address must
     never render alike; that distinction is the product, so each branch still
     states its own evidence. The wording stays factual — "private address", not
     "unverified" — and the standalone case still says plainly that nobody
     confirmed it. */
  if (input.source === "standalone") {
    return "Added by the provider · not confirmed";
  }
  if (input.authorIsFreeProvider && input.authorDomain) {
    return `Private address (${input.authorDomain})`;
  }
  if (input.authorDomainVerified && input.authorDomain) {
    return `${input.authorDomain} · domain verified`;
  }
  if (input.authorDomain) {
    return input.authorDomain;
  }
  return "Confirmed by the client";
}
