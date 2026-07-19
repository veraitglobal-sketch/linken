export type CaseStudyPartner = {
  slug: string;
  name: string;
  role: string;
  logoInitials: string;
  confirmed: boolean;
};

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  challenge: string;
  outcome: string;
  location: string;
  year: string;
  services: string[];
  partners: CaseStudyPartner[];
};
