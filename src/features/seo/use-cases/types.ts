export type UseCaseSection = {
  heading: string;
  paragraphs: string[];
};

export type UseCasePage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  lede: string;
  audience: string;
  sections: UseCaseSection[];
  checklist: string[];
  notThis: string[];
  relatedSlugs: string[];
};
