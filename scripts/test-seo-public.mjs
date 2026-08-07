import assert from "node:assert/strict";
import test from "node:test";

/**
 * Mirror of src/features/seo/* and reserved-slugs — keep in sync.
 * npm run test:seo
 */

function companyIndexability(input) {
  if (input.claimed === false) return { index: false, follow: true };
  return { index: true, follow: true };
}

function sitemapIncludesClaimed(claimed) {
  return claimed === true;
}

function isPublicRelationshipStatus(status) {
  return status === "confirmed" || status === "accepted";
}

function companyPath(slug) {
  return `/c/${slug}`;
}

function absoluteUrl(siteUrl, path) {
  const base = siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function buildCompanyCanonical(siteUrl, slug) {
  return absoluteUrl(siteUrl, companyPath(slug));
}

const RESERVED = new Set([
  "about",
  "pricing",
  "use-cases",
  "report",
  "search",
  "c",
  "g",
  "api",
  "admin",
  "dashboard",
  "login",
  "onboarding",
]);

function isReservedCompanySlug(slug) {
  const s = String(slug ?? "")
    .trim()
    .toLowerCase();
  if (!s) return true;
  if (RESERVED.has(s)) return true;
  if (s.includes("/") || s.includes(".")) return true;
  return false;
}

function validateOrganizationLd(data) {
  const issues = [];
  if (!data || typeof data !== "object") {
    return [{ path: "", message: "expected object" }];
  }
  const types = Array.isArray(data["@type"])
    ? data["@type"]
    : [data["@type"]];
  if (
    !types.includes("Organization") &&
    !types.includes("ProfessionalService")
  ) {
    issues.push({ path: "@type", message: "missing Organization type" });
  }
  if (typeof data.name !== "string" || !data.name.trim()) {
    issues.push({ path: "name", message: "required" });
  }
  if (typeof data.url !== "string" || !data.url.startsWith("http")) {
    issues.push({ path: "url", message: "absolute url required" });
  }
  return issues;
}

function validateArticleLd(data) {
  const issues = [];
  if (!data || data["@type"] !== "Article") {
    return [{ path: "@type", message: "expected Article" }];
  }
  if (typeof data.headline !== "string" || !data.headline.trim()) {
    issues.push({ path: "headline", message: "required" });
  }
  if (!data.author || typeof data.author !== "object") {
    issues.push({ path: "author", message: "required" });
  }
  return issues;
}

function hasForbiddenSchemaKeys(data, forbidden = ["client_confirmed", "pending", "claim_token"]) {
  if (!data || typeof data !== "object") return false;
  return forbidden.some((k) => k in data);
}

function publicReferencesOnly(refs) {
  return refs.filter((r) => r.status === "confirmed");
}

test("private/unclaimed profiles are not indexed", () => {
  assert.deepEqual(companyIndexability({ claimed: false }), {
    index: false,
    follow: true,
  });
  assert.equal(companyIndexability({ claimed: true }).index, true);
  assert.equal(companyIndexability({}).index, true);
});

test("pending relationships are not public", () => {
  assert.equal(isPublicRelationshipStatus("pending"), false);
  assert.equal(isPublicRelationshipStatus("confirmed"), true);
  assert.equal(isPublicRelationshipStatus("accepted"), true);
  const refs = publicReferencesOnly([
    { status: "pending", clientName: "Hidden Co" },
    { status: "confirmed", clientName: "Visible Co" },
  ]);
  assert.equal(refs.length, 1);
  assert.equal(refs[0].clientName, "Visible Co");
});

test("case studies: only confirmed are public (visitor rule)", () => {
  const cases = [
    { id: "1", clientConfirmation: null },
    { id: "2", clientConfirmation: { status: "pending" } },
    { id: "3", clientConfirmation: { status: "confirmed" } },
  ];
  const publicCases = cases.filter(
    (c) => c.clientConfirmation?.status === "confirmed",
  );
  assert.equal(publicCases.length, 1);
  assert.equal(publicCases[0].id, "3");
});

test("canonical URLs are /c/{slug}", () => {
  assert.equal(
    buildCompanyCanonical("https://hansala.com", "acme"),
    "https://hansala.com/c/acme",
  );
  assert.equal(
    buildCompanyCanonical("https://hansala.com/", "acme"),
    "https://hansala.com/c/acme",
  );
  assert.notEqual(companyPath("acme"), "/acme");
});

test("sitemaps exclude unclaimed companies", () => {
  assert.equal(sitemapIncludesClaimed(true), true);
  assert.equal(sitemapIncludesClaimed(false), false);
});

test("structured data shapes are valid", () => {
  const org = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    name: "Acme",
    url: "https://hansala.com/c/acme",
  };
  assert.equal(validateOrganizationLd(org).length, 0);
  assert.equal(hasForbiddenSchemaKeys(org), false);

  const badArticle = {
    "@type": "Article",
    headline: "Project",
    client_confirmed: true,
  };
  assert.ok(hasForbiddenSchemaKeys(badArticle));
  assert.ok(validateArticleLd(badArticle).some((i) => i.path === "author"));

  const article = {
    "@type": "Article",
    headline: "Project",
    author: { "@type": "Organization", name: "Acme" },
    additionalProperty: {
      "@type": "PropertyValue",
      name: "client_confirmed",
      value: true,
    },
  };
  assert.equal(validateArticleLd(article).length, 0);
  assert.equal(hasForbiddenSchemaKeys(article), false);
});

test("reserved slugs cannot collide with product routes", () => {
  assert.equal(isReservedCompanySlug("use-cases"), true);
  assert.equal(isReservedCompanySlug("pricing"), true);
  assert.equal(isReservedCompanySlug("acme-gmbh"), false);
  assert.equal(isReservedCompanySlug("foo.bar"), true);
});
