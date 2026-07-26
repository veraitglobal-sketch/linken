import type {
  ConfirmationDisclosure,
  ConfirmationLevel,
} from "@/features/confirmations/meta";

export type ClientConfirmationStatus = "pending" | "confirmed" | "declined";

export type ClientConfirmation = {
  id: string;
  caseStudyId: string;
  status: ClientConfirmationStatus;
  email: string;
  token: string;
  confirmedAt?: string;
  confirmationLevel?: ConfirmationLevel | null;
  disclosure?: ConfirmationDisclosure | null;
  confirmedBy?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    logoInitials: string;
  };
};

export type ClientConfirmationView = {
  id: string;
  caseStudyId: string;
  requestedByCompanyId: string;
  email: string;
  token: string;
  status: ClientConfirmationStatus;
  confirmedByCompanyId: string | null;
  createdAt: string;
  confirmedAt: string | null;
  caseTitle: string;
  caseSlug: string;
  caseSummary: string;
  caseYear: string;
  caseLocation: string;
  requesterName: string;
  requesterSlug: string;
  confirmerName: string | null;
  confirmerSlug: string | null;
  confirmerLogoUrl: string | null;
};
