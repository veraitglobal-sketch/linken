export type ServiceReferenceStatus = "pending" | "confirmed" | "declined";

export type ServiceReference = {
  id: string;
  clientName: string;
  clientCompanyId: string | null;
  clientSlug: string | null;
  service: string;
  startedYear: string;
  ongoing: boolean;
  endedYear: string | null;
  status: ServiceReferenceStatus;
  confirmedAt: string | null;
};
