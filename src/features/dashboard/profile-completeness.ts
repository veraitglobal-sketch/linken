export type CompletenessField = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

export type ProfileCompleteness = {
  score: number;
  total: number;
  fields: CompletenessField[];
  complete: boolean;
};

/** Lightweight profile checklist from fields already on the company. */
export function profileCompleteness(input: {
  slug: string;
  name: string;
  website: string | null | undefined;
  category: string | null | undefined;
  city: string | null | undefined;
  description?: string | null;
  verified: boolean;
}): ProfileCompleteness {
  const edit = `/c/${input.slug}`;
  const fields: CompletenessField[] = [
    {
      id: "name",
      label: "Company name",
      done: Boolean(input.name?.trim()),
      href: edit,
    },
    {
      id: "website",
      label: "Website",
      done: Boolean(input.website?.trim()),
      href: edit,
    },
    {
      id: "category",
      label: "Category",
      done: Boolean(input.category?.trim()),
      href: edit,
    },
    {
      id: "city",
      label: "City",
      done: Boolean(input.city?.trim()),
      href: edit,
    },
    {
      id: "verified",
      label: "Domain verified",
      done: input.verified,
      href: "/dashboard/verification",
    },
  ];
  const score = fields.filter((f) => f.done).length;
  return {
    score,
    total: fields.length,
    fields,
    complete: score === fields.length,
  };
}
