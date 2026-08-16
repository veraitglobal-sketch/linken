import type { PublicTestimonial } from "@/features/testimonials/types";

/**
 * The example universe, typed.
 *
 * `src/components/developers/examples.ts` already ships this cast — Example
 * Architecture, Elena Vogt, Nordwerk Holding — as the sample payload on
 * `/developers`. These are the same names in `PublicTestimonial` shape, so the
 * documentation and anything that renders a specimen tell one story instead of
 * two.
 *
 * **Where this may be used:** documentation, `/dev` routes, layout previews —
 * anywhere the subject is the mechanism rather than the record.
 *
 * **Where it may not:** any surface that presents these as Hansala's customers.
 * `AGENTS.md` forbids inventing a customer or a quote, and for a product whose
 * claim is that a record means something, a wall of fabricated praise is not a
 * shortcut — it is the one thing that would make the claim untrue. The names
 * read as examples on purpose, and a page showing them has to say that it is
 * showing an example.
 *
 * The bodies describe themselves rather than praising anyone. That is not
 * squeamishness: a preview exists to test measure, ragging and card rhythm at
 * known lengths, and copy that reads as a real endorsement cannot be pasted
 * into a public page by accident.
 */
export const EXAMPLE_TESTIMONIALS: PublicTestimonial[] = [
  record(
    "a",
    "Example body text at about ninety characters — the shortest card in the wall.",
    "Elena Vogt",
    "Project Director",
    "Nordwerk Holding",
    "Confirmed by the client · nordwerk-holding.com · domain verified",
  ),
  record(
    "b",
    "Example body text at roughly one hundred and fifty characters, which is where a quote stops being a line and starts being a small paragraph.",
    "Example Author",
    "Head of Delivery",
    "Example Build GmbH",
    "Confirmed by the client · example-build.de · domain verified",
  ),
  record(
    "c",
    "Example body text at about two hundred and ten characters. This is the length most quotes land on, so it is the one the card should set most comfortably — two or three lines and a clean rag on the right.",
    "Example Author",
    "Managing Partner",
    "Example Elektro",
    /* Factual, never judgemental — AGENTS.md. A free-provider address is stated
       as what it is and scores zero; it is never called unverified. */
    "Confirmed from a gmail.com address",
  ),
  record(
    "d",
    "Example body text at around two hundred and seventy characters. At this length the card is taller than its neighbour, which is the whole reason the columns are staggered: a wall of identical heights reads as a table, and a table reads as filler rather than as records.",
    "Example Author",
    "Operations Lead",
    "Example Logistik",
    "Confirmed by the client · example-logistik.de · domain verified",
  ),
  record(
    "e",
    "Example body text at roughly three hundred and thirty characters. A quote this long is where the reading measure matters: the column is 260 pixels at its narrowest, the body sets at the host's own size, and if the leading were still 1.35 the block would set as a slab instead of as something anybody actually reads to the end.",
    "Example Author",
    "Technical Director",
    "Example Ingenieure",
    "Confirmed by the client · example-ingenieure.de · domain verified",
  ),
  record(
    "f",
    "Example body text at just under three hundred and eighty characters, which is the cap a wall card is allowed. Anything past it is dropped rather than truncated, because the author's words are immutable and the layout is not — so the rule is that the wall bends around the quote. This card exists to show what the tallest permitted record does to the column it lands in.",
    "Example Author",
    "Founder",
    "Example Werkstatt",
    "Confirmed from a gmail.com address",
  ),
];

function record(
  id: string,
  body: string,
  authorName: string,
  authorRole: string,
  company: string,
  provenanceLine: string,
): PublicTestimonial {
  return {
    id: `example-${id}`,
    body,
    authorName,
    authorRole,
    authorCompany: {
      name: company,
      slug: company.toLowerCase().replace(/\s+/g, "-"),
    },
    source: "reference",
    publishedAt: "2025-09-12T14:30:00.000Z",
    profileUrl: "/c/example-architecture",
    provenanceLine,
  };
}
