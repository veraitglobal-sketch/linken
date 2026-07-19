import type { Project } from "@/types/project";

export const projectsByCompany: Record<string, Project[]> = {
  "acme-architecture": [
    {
      id: "p1",
      slug: "residence-berlin",
      title: "Residence Berlin-Mitte",
      summary:
        "Multi-unit residential renovation with coordinated construction and electrical partners.",
      location: "Berlin",
      year: "2025",
      services: ["Architecture", "Project oversight"],
    },
    {
      id: "p2",
      slug: "office-campus-spandau",
      title: "Office Campus Spandau",
      summary:
        "Workspace campus concept through permit stage, delivered with verified project partners.",
      location: "Berlin",
      year: "2024",
      services: ["Concept design", "Building permits"],
    },
  ],
};

export function getProjectsForCompany(slug: string) {
  return projectsByCompany[slug] ?? [];
}
