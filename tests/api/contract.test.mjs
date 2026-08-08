import assert from "node:assert/strict";
import test from "node:test";
import {
  API_COMPANY_REQUIRED_KEYS,
  FIXTURES,
  PUBLIC_FORBIDDEN_KEYS,
} from "../fixtures/synthetic.mjs";

/**
 * Public API v1 contract — shape + privacy invariants.
 * npm run test:api-contract
 */

const TRUST = new Set(["member", "established", "trusted", "pillar"]);

function validateCompanyResponse(body) {
  const errors = [];
  for (const key of API_COMPANY_REQUIRED_KEYS) {
    if (!(key in body)) errors.push(`missing ${key}`);
  }
  if (body.trust_level && !TRUST.has(body.trust_level)) {
    errors.push(`invalid trust_level ${body.trust_level}`);
  }
  if (typeof body.claimed !== "boolean") errors.push("claimed must be boolean");
  if (typeof body.verified !== "boolean")
    errors.push("verified must be boolean");
  if (body.claimed === false && body.stats != null) {
    errors.push("unclaimed companies must have null stats");
  }
  const json = JSON.stringify(body);
  for (const key of PUBLIC_FORBIDDEN_KEYS) {
    if (json.includes(`"${key}"`)) errors.push(`forbidden key ${key}`);
  }
  return errors;
}

function validateReferencesResponse(body) {
  const errors = [];
  if (!Array.isArray(body.references)) {
    return ["references must be an array"];
  }
  for (const ref of body.references) {
    if (ref.status && ref.status !== "confirmed") {
      errors.push("pending reference leaked");
    }
    if ("confirm_token" in ref || "invite_email" in ref) {
      errors.push("secret fields on reference");
    }
  }
  return errors;
}

test("contract: claimed company sample validates", () => {
  const body = {
    slug: FIXTURES.provider.slug,
    name: FIXTURES.provider.name,
    category: "Architecture",
    city: "Test City",
    country: "DE",
    website: FIXTURES.provider.website,
    verified: true,
    claimed: true,
    accepting_clients: true,
    trust_level: "established",
    stats: {
      confirmed_partners: 1,
      confirmed_references: 2,
      ongoing_references: 1,
      confirmed_case_studies: 0,
    },
    assessment: null,
    profile_url: `https://hansala.com/c/${FIXTURES.provider.slug}`,
    generated_at: new Date().toISOString(),
  };
  assert.deepEqual(validateCompanyResponse(body), []);
});

test("contract: unclaimed company must null stats", () => {
  const body = {
    slug: "draft-test-co",
    name: "Draft Test Co",
    category: "Consulting",
    city: "Test City",
    country: "",
    website: "",
    verified: false,
    claimed: false,
    accepting_clients: false,
    trust_level: "member",
    stats: { confirmed_partners: 0 },
    assessment: null,
    profile_url: "https://hansala.com/c/draft-test-co",
    generated_at: new Date().toISOString(),
  };
  assert.ok(
    validateCompanyResponse(body).includes(
      "unclaimed companies must have null stats",
    ),
  );
});

test("contract: references list rejects pending and secrets", () => {
  assert.deepEqual(
    validateReferencesResponse({
      references: [
        {
          client_name: FIXTURES.client.name,
          service: "Architecture",
          confirmed_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    }),
    [],
  );
  assert.ok(
    validateReferencesResponse({
      references: [{ client_name: "X", status: "pending" }],
    }).length > 0,
  );
  assert.ok(
    validateReferencesResponse({
      references: [{ client_name: "X", invite_email: "a@b.test" }],
    }).length > 0,
  );
});

function validateTestimonialsResponse(body) {
  const errors = [];
  if (!Array.isArray(body.testimonials)) {
    return ["testimonials must be an array"];
  }
  if (typeof body.count !== "number") errors.push("count must be number");
  const json = JSON.stringify(body);
  for (const key of [
    "submit_token",
    "author_email",
    "confirm_token",
    "status",
  ]) {
    if (json.includes(`"${key}"`)) errors.push(`forbidden key ${key}`);
  }
  for (const t of body.testimonials) {
    for (const req of [
      "id",
      "body",
      "author_name",
      "author_role",
      "source",
      "published_at",
      "provenance_line",
      "profile_url",
    ]) {
      if (!(req in t)) errors.push(`missing ${req}`);
    }
    if (
      t.author_company != null &&
      (typeof t.author_company.name !== "string" ||
        typeof t.author_company.slug !== "string")
    ) {
      errors.push("author_company must be {name,slug} or null");
    }
  }
  return errors;
}

test("contract: testimonials shape and no secret leak", () => {
  assert.deepEqual(
    validateTestimonialsResponse({
      count: 1,
      testimonials: [
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          body: "They delivered on scope.",
          author_name: "Elena Vogt",
          author_role: "Project Director",
          author_company: { name: "Nordwerk Holding", slug: "nordwerk-holding" },
          source: "case_study",
          published_at: "2025-09-12T14:30:00.000Z",
          provenance_line:
            "Confirmed by the client · nordwerk-holding.com · domain verified",
          profile_url: "https://hansala.com/c/example-architecture?src=testimonial",
        },
      ],
    }),
    [],
  );
  assert.ok(
    validateTestimonialsResponse({
      count: 1,
      testimonials: [
        {
          id: "x",
          body: "y",
          author_name: "A",
          author_role: "B",
          author_company: null,
          source: "standalone",
          published_at: "2025-01-01T00:00:00.000Z",
          provenance_line: "Added by the provider · not confirmed",
          profile_url: "https://hansala.com/c/x",
          submit_token: "secret",
        },
      ],
    }).length > 0,
  );
});
