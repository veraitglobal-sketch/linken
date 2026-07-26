type Op = { summary: string; operationId: string; tags: string[] };

function op(summary: string, operationId: string): Op {
  return { summary, operationId, tags: ["Public"] };
}

/** Path catalog for Public API OpenAPI 3.1 (no auth). */
export const PUBLIC_OPENAPI_PATHS = {
  "/companies/{slug}": {
    get: op("Get confirmed company profile", "getPublicCompany"),
  },
  "/companies/{slug}/references": {
    get: op("List confirmed client references", "getPublicReferences"),
  },
  "/companies/{slug}/case-studies": {
    get: op("List confirmed case studies", "getPublicCaseStudies"),
  },
  "/verify": {
    get: op("Trust oracle — look up a firm by website domain", "verifyDomain"),
  },
} as const;
