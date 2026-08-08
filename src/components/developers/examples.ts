/** Illustrative JSON / snippet examples — not live data. */

export function companyExample(siteUrl: string) {
  return `{
  "slug": "example-architecture",
  "name": "Example Architecture",
  "category": "Architecture",
  "city": "Berlin",
  "country": "Germany",
  "website": "https://example.com",
  "verified": true,
  "claimed": true,
  "accepting_clients": true,
  "trust_level": "established",
  "stats": {
    "confirmed_partners": 6,
    "confirmed_references": 4,
    "ongoing_references": 2,
    "confirmed_case_studies": 3
  },
  "assessment": {
    "would_work_again_yes": 9,
    "would_work_again_total": 10,
    "top_strengths": [
      { "key": "reliability", "label": "Reliability", "count": 8 },
      { "key": "deadlines", "label": "Deadlines", "count": 6 }
    ]
  },
  "profile_url": "${siteUrl}/c/example-architecture",
  "generated_at": "2026-07-19T18:00:00.000Z"
}`;
}

export function referencesExample() {
  return `{
  "references": [
    {
      "client_name": "Nordwerk Holding",
      "client_slug": "nordwerk-holding",
      "service": "Shell construction",
      "started_year": "2023",
      "ongoing": true,
      "ended_year": null,
      "confirmed_at": "2024-11-02T09:14:00.000Z",
      "confirmation_level": 2,
      "disclosure": "named"
    },
    {
      "client_name": "Undisclosed client",
      "client_slug": null,
      "service": "Electrical fit-out",
      "started_year": "2021",
      "ongoing": false,
      "ended_year": "2022",
      "confirmed_at": "2023-03-18T14:22:00.000Z",
      "confirmation_level": 1,
      "disclosure": "undisclosed"
    }
  ],
  "count": 2
}`;
}

export function caseStudiesExample(siteUrl: string) {
  return `{
  "case_studies": [
    {
      "slug": "residence-berlin",
      "title": "Residence Berlin",
      "summary": "Private residence delivered with confirmed build and electrical partners.",
      "year": "2024",
      "location": "Berlin, Germany",
      "url": "${siteUrl}/c/example-architecture/case-studies/residence-berlin",
      "client_confirmed": true,
      "confirmed_partners": [
        { "name": "Example Build GmbH", "slug": "example-build" },
        { "name": "Example Elektro", "slug": "example-elektro" }
      ]
    }
  ],
  "count": 1
}`;
}

export function testimonialsExample(siteUrl: string) {
  return `{
  "company": {
    "name": "Example Architecture",
    "slug": "example-architecture",
    "profile_url": "${siteUrl}/c/example-architecture"
  },
  "layout": "grid",
  "theme": {
    "preset": "minimal",
    "font_family": "\\"Newsreader\\", Georgia, serif",
    "font_size": 15,
    "text_color": "#0e1f1c",
    "muted_color": "#5c6b68",
    "accent_color": "#1a5c51",
    "background": "transparent",
    "card_background": "transparent",
    "css_vars": {
      "--hs-tm-text": "#0e1f1c",
      "--hs-tm-muted": "#5c6b68",
      "--hs-tm-accent": "#1a5c51"
    }
  },
  "attribution": {
    "label": "Verified on Hansala",
    "url": "${siteUrl}/c/example-architecture?src=testimonial_api"
  },
  "embed": {
    "iframe_url": "${siteUrl}/embed/example-architecture?variant=testimonials",
    "script_url": "${siteUrl}/hs-testimonials.js?v=2"
  },
  "testimonials": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "body": "They delivered on scope and kept us informed at every stage. We would work with them again.",
      "author_name": "Elena Vogt",
      "author_role": "Project Director",
      "author_company": {
        "name": "Nordwerk Holding",
        "slug": "nordwerk-holding"
      },
      "source": "case_study",
      "published_at": "2025-09-12T14:30:00.000Z",
      "provenance_line": "Confirmed by the client · nordwerk-holding.com · domain verified",
      "profile_url": "${siteUrl}/c/example-architecture?src=testimonial"
    }
  ],
  "count": 1
}`;
}

export function errorExample() {
  return `{
  "error": {
    "code": "not_found",
    "message": "Company not found."
  }
}`;
}

export function verifyExample(siteUrl: string) {
  return `{
  "found": true,
  "company": {
    "name": "Example Architecture",
    "slug": "example-architecture",
    "profile_url": "${siteUrl}/c/example-architecture"
  },
  "verified": true,
  "verification_method": "dns_txt",
  "verified_since": "2025-11-04T10:00:00.000Z",
  "trust_level": "established",
  "stats": {
    "confirmed_partners": 6,
    "confirmed_references": 4,
    "ongoing_references": 2,
    "confirmed_case_studies": 3
  },
  "assessment": {
    "would_work_again_yes": 9,
    "would_work_again_total": 10,
    "top_strengths": [
      { "key": "reliability", "label": "Reliability", "count": 8 }
    ]
  },
  "llm_md_url": "${siteUrl}/c/example-architecture/llm.md",
  "api_url": "${siteUrl}/api/v1/companies/example-architecture",
  "generated_at": "2026-07-19T18:00:00.000Z"
}`;
}

export function curlGet(url: string) {
  return `curl -sS "${url}" \\
  -H "Accept: application/json"`;
}

export function jsFetch(url: string) {
  return `const res = await fetch("${url}", {
  headers: { Accept: "application/json" },
});

if (!res.ok) {
  const err = await res.json();
  throw new Error(err.error?.message ?? res.statusText);
}

const data = await res.json();
console.log(data);`;
}

export function curlBearer(
  method: string,
  url: string,
  body?: string,
) {
  const lines = [
    `curl -sS -X ${method} "${url}" \\`,
    `  -H "Authorization: Bearer hs_…" \\`,
    `  -H "Accept: application/json"`,
  ];
  if (body) {
    lines[lines.length - 1] += " \\";
    lines.push(`  -H "Content-Type: application/json" \\`);
    lines.push(`  -d '${body}'`);
  }
  return lines.join("\n");
}

export function jsBearer(
  method: string,
  url: string,
  body?: Record<string, unknown>,
) {
  const hasBody = body !== undefined;
  return `const res = await fetch("${url}", {
  method: "${method}",
  headers: {
    Authorization: \`Bearer \${process.env.HANSALA_AGENT_API_KEY}\`,
    Accept: "application/json",${hasBody ? `\n    "Content-Type": "application/json",` : ""}
  },${hasBody ? `\n  body: JSON.stringify(${JSON.stringify(body, null, 2).split("\n").join("\n  ")}),` : ""}
});

const json = await res.json();
if (!res.ok) throw new Error(json.error?.message ?? res.statusText);
console.log(json.data);`;
}

export function embedSnippet(
  siteUrl: string,
  slug: string,
  variant: "horizontal" | "assessment" | "references" | "micro" | "verified",
  height: number,
) {
  const src =
    variant === "horizontal"
      ? `${siteUrl}/embed/${slug}`
      : `${siteUrl}/embed/${slug}?variant=${variant}`;
  return `<iframe src="${src}" width="320" height="${height}" style="border:0" title="Verified on Hansala" loading="lazy"></iframe>`;
}
