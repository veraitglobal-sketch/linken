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
  if (input.source === "standalone") {
    return "Added by the provider · not confirmed";
  }
  if (input.authorIsFreeProvider && input.authorDomain) {
    return `Confirmed from a private address (${input.authorDomain})`;
  }
  if (input.authorDomainVerified && input.authorDomain) {
    return `Confirmed by the client · ${input.authorDomain} · domain verified`;
  }
  if (input.authorDomain) {
    return `Confirmed by the client · ${input.authorDomain}`;
  }
  return "Confirmed by the client";
}
